using System;
using System.Collections.Generic;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Text.Json;
using System.Text.RegularExpressions;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Common.Models;
using Common.Services;

namespace GradeAndAnalysesService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class GradeAndAnalysesService : StatefulService, IGradeAndAnalysesService
    {
        public GradeAndAnalysesService(StatefulServiceContext context)
            : base(context)
        { }

        private readonly HttpClient _httpClient = new HttpClient();
        private const string GEMINI_API_KEY = "AIzaSyBPBbg4TNRyJdcEehNJdF447G2WpsyiBlI";
        private const string GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        private IReliableDictionary<string, string> _promptTemplates;

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            _promptTemplates = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, string>>("PromptTemplates");
            using (var tx = this.StateManager.CreateTransaction())
            {
                await _promptTemplates.AddOrUpdateAsync(tx, "error", "Identify any errors in the following student work(file of any type). List as few errors as possible with a very brief explanation, and return no empty lines:\n{0}", (key, value) => value);
                await _promptTemplates.AddOrUpdateAsync(tx, "improvement", "Suggest improvements for the following work(file of any type). Provide brief actionable feedback, and return no empty lines:\n{0}", (key, value) => value);
                await _promptTemplates.AddOrUpdateAsync(tx, "score", "Evaluate the following work(file of any type). Provide a score between 0 and 100:\n{0}", (key, value) => value);
                await tx.CommitAsync();
            }
        }

        public async Task<bool> SetPrompts(string errorPrompt, string improvementPrompt, string scorePrompt)
        {
            using (var tx = this.StateManager.CreateTransaction())
            {
                if (!string.IsNullOrWhiteSpace(errorPrompt))
                    await _promptTemplates.SetAsync(tx, "error", errorPrompt);
                if (!string.IsNullOrWhiteSpace(improvementPrompt))
                    await _promptTemplates.SetAsync(tx, "improvement", improvementPrompt);
                if (!string.IsNullOrWhiteSpace(scorePrompt))
                    await _promptTemplates.SetAsync(tx, "score", scorePrompt);
                await tx.CommitAsync();
                return true;
            }
        }

        public async Task<Dictionary<string, string>> GetPrompts()
        {
            var prompts = new Dictionary<string, string>();

            using (var tx = this.StateManager.CreateTransaction())
            {
                var errorPrompt = await _promptTemplates.TryGetValueAsync(tx, "error");
                var improvementPrompt = await _promptTemplates.TryGetValueAsync(tx, "improvement");
                var scorePrompt = await _promptTemplates.TryGetValueAsync(tx, "score");

                if (errorPrompt.HasValue) prompts["error"] = errorPrompt.Value;
                if (improvementPrompt.HasValue) prompts["improvement"] = improvementPrompt.Value;
                if (scorePrompt.HasValue) prompts["score"] = scorePrompt.Value;
            }

            return prompts;
        }


        public async Task<Review> AnalyzeWork(StudentUpload studentUpload)
        {
            if (studentUpload == null || studentUpload.Versions.Count == 0)
                return new Review { Grade = 0, Errors = "Invalid upload" };

            UploadVersion versionToAnalyze = studentUpload.Versions.FirstOrDefault(v => v.VersionNumber == studentUpload.ActiveVersion);

            if (versionToAnalyze == null)
                return new Review { Grade = 0, Errors = "Invalid work version"  };

            byte[] fileData = versionToAnalyze.File;
            if (fileData == null)
                return new Review { Grade = 0, Errors = "Failed to download file"  };

            string extractedText = Encoding.UTF8.GetString(fileData);
            return await GetAIAnalysis(extractedText);
        }

        private async Task<Review> GetAIAnalysis(string textContent)
        {
            try
            {
                string errorPrompt, improvementPrompt, scorePrompt;
                using (var tx = this.StateManager.CreateTransaction())
                {
                    var errorResult = await _promptTemplates.TryGetValueAsync(tx, "error").ConfigureAwait(false);
                    var improvementResult = await _promptTemplates.TryGetValueAsync(tx, "improvement").ConfigureAwait(false);
                    var scoreResult = await _promptTemplates.TryGetValueAsync(tx, "score").ConfigureAwait(false);

                    errorPrompt = string.Format(errorResult.HasValue ? errorResult.Value : "", textContent);
                    improvementPrompt = string.Format(improvementResult.HasValue ? improvementResult.Value : "", textContent);
                    scorePrompt = string.Format(scoreResult.HasValue ? scoreResult.Value : "", textContent);
                }


                string errors = await GetAIResponse(errorPrompt);
                string improvements = await GetAIResponse(improvementPrompt);
                string scoreResponse = await GetAIResponse(scorePrompt);

                int score = ExtractScore(scoreResponse);

                return new Review
                {
                    Grade = score,
                    Errors = errors,
                    Improvements = improvements,
                    Recommendations = "No recommendations available"
                };
            }
            catch (Exception ex)
            {
                return new Review { Grade = 0, Errors = "Error when automatic grading" };
            }
        }

        private async Task<string> GetAIResponse(string prompt)
        {
            var requestBody = new
            {
                contents = new[]
                {
                    new { parts = new[] { new { text = prompt } } }
                }
            };

            var requestJson = JsonSerializer.Serialize(requestBody);
            var requestContent = new StringContent(requestJson, Encoding.UTF8, "application/json");

            HttpResponseMessage response = await _httpClient.PostAsync($"{GEMINI_API_URL}?key={GEMINI_API_KEY}", requestContent);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<GeminiResponse>(responseJson);

            return result?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text ?? "No response";
        }

        private int ExtractScore(string aiResponse)
        {
            if (string.IsNullOrEmpty(aiResponse))
                return 0;

            var match = Regex.Match(aiResponse, @"\b([0-9]{1,3})\b");
            if (match.Success && int.TryParse(match.Value, out int score))
            {
                return Math.Clamp(score, 0, 100);
            }

            return 50;
        }


        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners() => this.CreateServiceRemotingReplicaListeners();
    }

    public class GeminiResponse
    {
        public List<Candidate> candidates { get; set; }
    }

    public class Candidate
    {
        public Content content { get; set; }
    }

    public class Content
    {
        public List<Part> parts { get; set; }
    }

    public class Part
    {
        public string text { get; set; }
    }
}
