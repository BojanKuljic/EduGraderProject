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

namespace ProgressService
{
    /// <summary>
    /// An instance of this class is created for each service instance by the Service Fabric runtime.
    /// </summary>
    internal sealed class ProgressService : StatelessService, IProgressService
    {
        public ProgressService(StatelessServiceContext context)
            : base(context)
        { }

        private string FindMostCommonMistake(List<StudentUpload> studentWorks)
        {
            var allErrors = studentWorks
                .Where(w => w.Review != null && w.Review.Errors != null)
                .Select(w => w.Review.Errors).ToList();

            if (allErrors.Count == 0)
            {
                return "No mistakes found.";
            }

            var groupedErrors = allErrors
                .GroupBy(e => e)
                .OrderByDescending(g => g.Count())
                .ToList();

            if (groupedErrors.Count < 2 || groupedErrors.First().Count() == 1)
            {
                return "No common mistakes";
            }

            return groupedErrors.First().Key;
        }



        public async Task<UploadProgress> GenerateStudentProgress(string email, List<StudentUpload> studentWorks)
        {
            var relevantWorks = studentWorks.Where(w => w.Email == email && w.Review != null).ToList();

            int uploadNum = relevantWorks.Count;
            double averageGrade = uploadNum > 0
                ? relevantWorks.Average(w => w.Review.Grade)
                : 0;

            var scoreHistory = relevantWorks
                .OrderBy(w => w.UploadDate)
                .ToDictionary(w => w.UploadDate, w => w.Review.Grade);

            return new UploadProgress
            {
                Email = email,
                TotalWorks = uploadNum,
                AverageGrade = Math.Round(averageGrade, 2),
            };
        }


        protected override IEnumerable<ServiceInstanceListener> CreateServiceInstanceListeners() => this.CreateServiceRemotingInstanceListeners();
        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            // TODO: Replace the following sample code with your own logic 
            //       or remove this RunAsync override if it's not needed in your service.

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
