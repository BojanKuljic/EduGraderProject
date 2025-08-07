using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.Models;
using Common.Services;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Common.Database;

namespace ProgressService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    internal sealed class ProgressService : StatelessService, IProgressService
    {
        private readonly UploadDatabase _uploadDatabase;
        public ProgressService(StatelessServiceContext context)
            : base(context)
        {
            _uploadDatabase = new UploadDatabase("mongodb://localhost:27017", "UploadDatabase", "Uploads");
        }

        public async Task<List<string>> FindMostCommonMistakes()
        {
            List<StudentUpload> studentWorks = await _uploadDatabase.GetAllUploads();

            var allErrorsText = studentWorks
                .Where(w => w.Review != null && !string.IsNullOrWhiteSpace(w.Review.Errors))
                .Select(w => w.Review.Errors)
                .ToList();

            if (allErrorsText.Count == 0)
                return new List<string> { "No mistakes found." };

            var allIndividualErrors = allErrorsText
                .SelectMany(e => e.Split(new[] { '\r', '\n' }, StringSplitOptions.RemoveEmptyEntries))
                .Select(e => e.Trim())
                .Where(e => !string.IsNullOrWhiteSpace(e))
                .ToList();

            var grouped = allIndividualErrors
                .GroupBy(err => err)
                .Where(g => g.Count() >= 2)
                .OrderByDescending(g => g.Count());

            if (!grouped.Any())
                return new List<string> { "No common mistakes." };

            return grouped
                .Select(g => $"{g.Key} - {g.Count()}x")
                .ToList();
        }


        public async Task<double> CalculateAverageGrade()
        {
            List<StudentUpload> studentWorks = await _uploadDatabase.GetAllUploads();

            var graded = studentWorks
                .Where(w =>
                    w.Review != null &&
                    w.Review.Grade >= 5 && w.Review.Grade <= 10 &&
                    !string.Equals(w.Review.Errors?.Trim(), "Error when automatic grading", StringComparison.OrdinalIgnoreCase)
                )
                .Select(w => w.Review.Grade)
                .ToList();

            if (graded.Count == 0)
                return 0;

            return Math.Round(graded.Average(), 2);
        }

        public async Task<List<(DateTime Timestamp, double Grade)>> GetAllGradesWithTimestamps()
        {
            List<StudentUpload> studentWorks = await _uploadDatabase.GetAllUploads();

            var gradedWithTimestamps = studentWorks
                .Where(w => w.Review != null)
                .Select(w =>
                {
                    var version = w.Versions.FirstOrDefault(v => v.VersionNumber == w.ActiveVersion);
                    return version != null
                        ? (Timestamp: version.UploadedAt, Grade: w.Review.Grade)
                        : (Timestamp: DateTime.MinValue, Grade: 0);
                })
                .Where(g => g.Timestamp != DateTime.MinValue)
                .OrderByDescending(g => g.Timestamp)
                .ToList();

            return gradedWithTimestamps;
        }

        public async Task<UploadProgress> GenerateStudentProgress(string email, List<StudentUpload> studentWorks)
        {
            // Filtriraj samo radove za datog studenta koji imaju validan review i ocenu od 5 do 10
            var relevantWorks = studentWorks
                .Where(w =>
                    w.Email == email &&
                    w.Review != null &&
                    w.Review.Grade >= 5 && w.Review.Grade <= 10 &&
                    !string.Equals(w.Review.Errors?.Trim(), "Error when automatic grading", StringComparison.OrdinalIgnoreCase)
                )
                .ToList();

            int uploadNum = relevantWorks.Count;

            double averageGrade = uploadNum > 0
                ? Math.Round(relevantWorks.Average(w => w.Review.Grade), 2)
                : 0;

            return new UploadProgress
            {
                Email = email,
                TotalWorks = uploadNum,
                AverageGrade = averageGrade
            };
        }


        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners() => this.CreateServiceRemotingInstanceListeners();
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
           
            long iterations = 0;

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();

                ServiceEventSource.Current.ServiceMessage(this.Context, "Working-{0}", ++iterations);

                await Task.Delay(TimeSpan.FromSeconds(1), cancellationToken);
            }
        }
    }
}
