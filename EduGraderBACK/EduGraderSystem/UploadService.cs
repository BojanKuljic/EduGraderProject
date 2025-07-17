using System;
using System.Collections.Generic;
using System.Fabric;
using System.Globalization;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.Database;
using Common.Models;
using Common.Services;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace UploadService
{
    /// <summary>
    /// An instance of this class is created for each service replica by the Service Fabric runtime.
    /// </summary>
    internal sealed class UploadService : StatefulService, IUploadService
    {
        private readonly UploadDatabase _uploadDatabase;
        public UploadService(StatefulServiceContext context)
            : base(context)
        {
            _uploadDatabase = new UploadDatabase("mongodb://localhost:27017", "UploadDatabase", "Uploads");
        }

        public Task<bool> NewUpload(string email, byte[] file, string title, string course)
        {
            List<UploadVersion> versions = new List<UploadVersion>();
            versions.Add(new UploadVersion { File = file, VersionNumber = 0, UploadedAt = DateTime.Now });
            StudentUpload newUpload = new StudentUpload { ActiveVersion = 0, Email = email, Course = course, Title = title, UploadDate = DateTime.Now, Versions = versions };
            
            return _uploadDatabase.AddUpload(newUpload);
        }

        public async Task<StudentUpload> GetStudentUpload(string id)
        {
            var work = await _uploadDatabase.GetUpload(id);
            return work == null ? null : work;
        }

        public async Task<bool> RevertVersion(string id, int version)
        {
            var upload = await _uploadDatabase.GetUpload(id);
            if (upload == null) return false;

            upload.ActiveVersion = (uint)version;

            var success = await _uploadDatabase.UpdateUpload(upload.Id, upload);
            return success ? true : false;
        }

        public async Task<bool> UpdateUpload(byte[] file, string uploadId)
        {
            var upload = await _uploadDatabase.GetUpload(uploadId);
            if (upload == null) return false;

            var newVersion = new UploadVersion
            {
                VersionNumber = upload.Versions.Count + 1,
                File = file,
                UploadedAt = DateTime.UtcNow
            };

            upload.Versions.Add(newVersion);

            var success = await _uploadDatabase.UpdateUpload(upload.Id, upload);
            return success ? true : false;
        }

        public async Task<List<StudentUpload>> GetAllStudentUploads(string email)
        {
            var uploads = await _uploadDatabase.GetStudentUploadsByEmail(email);
            if (uploads == null || !uploads.Any())
                return null;

            return uploads;
        }

        public async Task<List<StudentUpload>> GetAllUploads()
        {
            var allUploads = await _uploadDatabase.GetAllUploads();
            return allUploads ?? new List<StudentUpload>();
        }

        public async Task<Review> GetReview(string uploadId)
        {
            var upload = await _uploadDatabase.GetUpload(uploadId);
            if (upload == null || upload.Review == null) return null;

            return upload.Review;
        }


        public async Task<bool> ProfessorReview(string id, Review review)
        {
            var upload = await _uploadDatabase.GetUpload(id);
            if (upload == null) return false;

            upload.Review = review;

            var success = await _uploadDatabase.UpdateUpload(upload.Id, upload);
            return success ? true: false;
        }

        /// <summary>
        /// Optional override to create listeners (e.g., HTTP, Service Remoting, WCF, etc.) for this service replica to handle client or user requests.
        /// </summary>
        /// <remarks>
        /// For more information on service communication, see https://aka.ms/servicefabricservicecommunication
        /// </remarks>
        /// <returns>A collection of listeners.</returns>
        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners() => this.CreateServiceRemotingReplicaListeners();

    }
}
