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
using Common.Database;

namespace GradeAndAnalysesService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class GradeAndAnalysesService : StatefulService, IGradeAndAnalysesService
    {
        private readonly UploadDatabase _uploadDatabase;
        private IReliableDictionary<string, SystemSettings> _systemSettings;

        public GradeAndAnalysesService(StatefulServiceContext context)
            : base(context)
        {
            _uploadDatabase = new UploadDatabase("mongodb://localhost:27017", "UploadDatabase", "Uploads");
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            _promptTemplates = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, string>>("PromptTemplates");
            _systemSettings = await this.StateManager.GetOrAddAsync<IReliableDictionary<string, SystemSettings>>("SystemSettings");

            using (var tx = this.StateManager.CreateTransaction())
            {
                await _promptTemplates.AddOrUpdateAsync(tx, "error", "Identify any errors in the following student work(file of any type). List as few errors as possible with a very brief explanation, and return no empty lines:\n{0}", (key, value) => value);
                await _promptTemplates.AddOrUpdateAsync(tx, "improvement", "Suggest improvements for the following work(file of any type). Provide brief actionable feedback, and return no empty lines:\n{0}", (key, value) => value);
                await _promptTemplates.AddOrUpdateAsync(tx, "score", "Evaluate the following work(file of any type). Provide a score between 0 and 100:\n{0}", (key, value) => value);
                await _promptTemplates.AddOrUpdateAsync(tx, "recommendation",
                    "Based on the analysis of this student work, provide personalized recommendations for further learning. Include relevant online resources such as courses, articles, or books. Format as a list with links if possible:\n{0}",
                     (key, value) => value);

                await tx.CommitAsync();
            }

            SemaphoreSlim semaphore = new SemaphoreSlim(3); // Allow 3 analyses in parallel

            while (!cancellationToken.IsCancellationRequested)
            {
                try
                {
                    var uploads = await _uploadDatabase.GetAllUploads();
                    if (uploads != null)
                    {
                        foreach (var upload in uploads)
                        {
                            if (upload.Review == null)
                            {
                                await semaphore.WaitAsync();

                                _ = Task.Run(async () =>
                                {
                                    try
                                    {
                                        var review = await AnalyzeWork(upload);
                                        upload.Review = review;
                                        upload.UsualReviewTime = review.UsualReviewTime;

                                        if (upload.Versions != null && upload.ActiveVersion < upload.Versions.Count)
                                        {
                                            upload.Versions[upload.ActiveVersion].Review = review;
                                        }

                                        upload.Status = (review.Grade == 0 || string.IsNullOrWhiteSpace(review.Improvements))
                                            ? Status.Rejected
                                            : Status.FeedbackReady;

                                        await _uploadDatabase.UpdateUpload(upload.Id, upload);
                                    }
                                    catch (Exception ex)
                                    {
                                        ServiceEventSource.Current.ServiceMessage(Context, $"AI Analysis Error: {ex.Message}");
                                    }
                                    finally
                                    {
                                        semaphore.Release();
                                    }
                                });
                            }
                        }
                    }
                }
                catch (Exception ex)
                {
                    ServiceEventSource.Current.ServiceMessage(Context, $"Error in background review processing: {ex.Message}");
                }

                await Task.Delay(TimeSpan.FromMinutes(1), cancellationToken);
            }
        }


        private readonly HttpClient _httpClient = new HttpClient();
        private const string GEMINI_API_KEY = "AIzaSyBPBbg4TNRyJdcEehNJdF447G2WpsyiBlI";
        private const string GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

        private IReliableDictionary<string, string> _promptTemplates;


        public async Task<SystemSettings> GetSystemSettings()
        {
            return await _uploadDatabase.GetSystemSettings();
        }

        public async Task<bool> SetSystemSettings(SystemSettings settings)
        {
            return await _uploadDatabase.SetSystemSettings(settings);
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
                return new Review { Grade = 0, Errors = "Invalid work version" };

            byte[] fileData = versionToAnalyze.File;
            if (fileData == null)
                return new Review { Grade = 0, Errors = "Failed to download file" };
            string extractedText = ExtractTextFromFile(fileData, versionToAnalyze.FileName);
            ;
            var settings = await _uploadDatabase.GetSystemSettings();
            if (settings == null)
                return new Review { Grade = 0, Errors = "Missing system settings" };

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            Review review;

            switch (settings.AnalysisMethod?.ToLower())
            {
                case "basic":
                    review = GetBasicAnalysis(extractedText, settings);
                    break;
                case "regex":
                    review = GetRegexAnalysis(extractedText, settings);
                    break;
                case "ai":
                default:
                    review = await GetAIAnalysis(extractedText, settings);
                    break;
            }

            stopwatch.Stop();
            review.UsualReviewTime = stopwatch.ElapsedMilliseconds;

            return review;
        }

        private string ExtractTextFromFile(byte[] fileData, string fileName)
        {
            try
            {
                string extension = Path.GetExtension(fileName).ToLower();

                using var stream = new MemoryStream(fileData);

                return extension switch
                {
                    ".pdf" => ExtractFromPdf(stream),
                    ".docx" => ExtractFromWord(stream),
                    ".xlsx" => ExtractFromExcel(stream),
                    ".txt" => ExtractFromTxt(stream),
                    ".png" or ".jpg" or ".jpeg" => ExtractFromImage(stream),
                    _ => Encoding.UTF8.GetString(fileData)
                };
            }
            catch
            {
                return "Failed to extract text.";
            }
        }
        private string ExtractFromWord(Stream stream)
        {
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            using var doc = Xceed.Words.NET.DocX.Load(ms);
            return doc.Text;
        }

        private string ExtractFromExcel(Stream stream)
        {
            using var workbook = new ClosedXML.Excel.XLWorkbook(stream);
            StringBuilder sb = new();

            foreach (var sheet in workbook.Worksheets)
            {
                foreach (var row in sheet.RowsUsed())
                {
                    foreach (var cell in row.Cells())
                        sb.Append(cell.Value.ToString()).Append(' ');
                    sb.AppendLine();
                }
            }

            return sb.ToString();
        }

        private string ExtractFromImage(Stream stream)
        {
            using var ms = new MemoryStream();
            stream.CopyTo(ms);
            ms.Position = 0;

            using var engine = new Tesseract.TesseractEngine(@"./tessdata", "eng+srp", Tesseract.EngineMode.Default);
            using var img = Tesseract.Pix.LoadFromMemory(ms.ToArray());
            using var page = engine.Process(img);
            return page.GetText();
        }



        private string ExtractFromTxt(Stream stream)
        {
            using var reader = new StreamReader(stream);
            return reader.ReadToEnd();
        }





        private string ExtractFromPdf(Stream stream)
        {
            using var reader = new iText.Kernel.Pdf.PdfReader(stream);
            using var pdfDoc = new iText.Kernel.Pdf.PdfDocument(reader);
            var strategy = new iText.Kernel.Pdf.Canvas.Parser.Listener.SimpleTextExtractionStrategy();

            StringBuilder sb = new();

            for (int i = 1; i <= pdfDoc.GetNumberOfPages(); i++)
            {
                var page = pdfDoc.GetPage(i);
                string text = iText.Kernel.Pdf.Canvas.Parser.PdfTextExtractor.GetTextFromPage(page, strategy);
                sb.AppendLine(text);
            }

            return sb.ToString();
        }



        private Review GetBasicAnalysis(string text, SystemSettings settings)
        {
            int wordCount = text.Split(' ', StringSplitOptions.RemoveEmptyEntries).Length;
            int grade = wordCount > 300 ? 10 : wordCount > 200 ? 8 : wordCount > 100 ? 6 : 5;

            return new Review
            {
                Grade = grade,
                Errors = "Basic method does not detect specific issues.",
                Improvements = "Consider expanding your arguments or examples.",
                Recommendations = "Review basic writing principles.",
                UsualReviewTime = 0
            };
        }

        private Review GetRegexAnalysis(string text, SystemSettings settings)
        {
            var keywordMatches = Regex.Matches(text, @"\berror\b", RegexOptions.IgnoreCase);
            int count = keywordMatches.Count;

            int grade = count == 0 ? 10 : count == 1 ? 8 : count == 2 ? 7 : 6;

            return new Review
            {
                Grade = grade,
                Errors = count > 0 ? $"Found '{count}' instances of the word 'error'." : "No errors detected.",
                Improvements = "Refine expressions and improve structure.",
                Recommendations = "Check grammar and clarity of argumentation.",
                UsualReviewTime = 0
            };
        }




        private async Task<Review> GetAIAnalysis(string textContent, SystemSettings settings)
        {
            try
            {
                string errorPrompt, improvementPrompt, scorePrompt, recommendationPrompt;

                if (settings.Language?.ToLower() == "code")
                {
                    errorPrompt = $"Analyze this code for bugs and issues:\n{textContent}";
                    improvementPrompt = $"Suggest improvements for this code:\n{textContent}";
                    scorePrompt = $"Rate the code quality from 0 to 100:\n{textContent}";
                    recommendationPrompt = $"Suggest coding resources to improve this code:\n{textContent}";
                }
                else
                {
                    using var tx = this.StateManager.CreateTransaction();

                    errorPrompt = string.Format((await _promptTemplates.TryGetValueAsync(tx, "error")).Value, textContent);
                    improvementPrompt = string.Format((await _promptTemplates.TryGetValueAsync(tx, "improvement")).Value, textContent);
                    scorePrompt = string.Format((await _promptTemplates.TryGetValueAsync(tx, "score")).Value, textContent);
                    recommendationPrompt = string.Format((await _promptTemplates.TryGetValueAsync(tx, "recommendation")).Value, textContent);
                }

                string errors = await GetAIResponse(errorPrompt);
                string improvements = await GetAIResponse(improvementPrompt);
                string scoreResponse = await GetAIResponse(scorePrompt);
                string recommendations = await GetAIResponse(recommendationPrompt);

                int score = ExtractScore(scoreResponse);

                switch (settings.EvaluationStyle?.ToLower())
                {
                    case "strict":
                        score = Math.Max(5, score - 1);
                        break;
                    case "lenient":
                        score = Math.Min(10, score + 1);
                        break;
                        // "normal" ili default ne menja ocenu
                }

                return new Review
                {
                    Grade = score,
                    Errors = errors,
                    Improvements = improvements,
                    Recommendations = recommendations
                };
            }
            catch
            {
                return new Review { Grade = 0, Errors = "Error during AI analysis" };
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

            for (int i = 0; i < 3; i++)
            {
                try
                {
                    HttpResponseMessage response = await _httpClient.PostAsync($"{GEMINI_API_URL}?key={GEMINI_API_KEY}", requestContent);
                    response.EnsureSuccessStatusCode();

                    var responseJson = await response.Content.ReadAsStringAsync();
                    var result = JsonSerializer.Deserialize<GeminiResponse>(responseJson);

                    return result?.candidates?.FirstOrDefault()?.content?.parts?.FirstOrDefault()?.text ?? "No response";
                }
                catch
                {
                    await Task.Delay(1000); // Wait 1 second before retry
                }
            }

            return "AI failed after retries";
        }



        private int ExtractScore(string aiResponse)
        {
            if (string.IsNullOrEmpty(aiResponse))
                return 5;

            var match = Regex.Match(aiResponse, @"\b([0-9]{1,3})\b");
            if (match.Success && int.TryParse(match.Value, out int rawScore))
            {
                int clamped = Math.Clamp(rawScore, 0, 100);

                // 🎓 Mapiraj na akademsku skalu od 5 do 10
                if (clamped < 50) return 5;              // Ne prolazi
                if (clamped < 60) return 6;
                if (clamped < 70) return 7;
                if (clamped < 85) return 8;
                if (clamped < 95) return 9;
                return 10;                               // Najveća ocena
            }

            return 5;
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
