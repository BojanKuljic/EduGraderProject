using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Common.Database;
using Common.Models;
using Common.Services;
using Microsoft.ServiceFabric.Data.Collections;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;

namespace UploadService
{
    internal sealed class UploadService : StatefulService, IUploadService
    {
        private readonly UploadDatabase _uploadDatabase;

        public UploadService(StatefulServiceContext context)
            : base(context)
        {
            _uploadDatabase = new UploadDatabase("mongodb://localhost:27017", "UploadDatabase", "Uploads");
        }

        public async Task<bool> NewUpload(string email, byte[] file, string title, string course, string fileName)
        {
            var settings = await _uploadDatabase.GetSystemSettings();
            if (settings != null && settings.MaxUploads > 0)
            {
                var uploads = await _uploadDatabase.GetStudentUploadsByEmail(email);

                DateTime threshold = settings.Period.ToLower() switch
                {
                    "daily" => DateTime.UtcNow.AddDays(-1),
                    "weekly" => DateTime.UtcNow.AddDays(-7),
                    "monthly" => DateTime.UtcNow.AddMonths(-1),
                    _ => DateTime.MinValue
                };

                int count = uploads.Count(u => u.UploadDate >= threshold);
                if (count >= settings.MaxUploads)
                    return false;
            }

            List<UploadVersion> versions = new List<UploadVersion>
            {
                new UploadVersion { File = file, VersionNumber = 0, UploadedAt = DateTime.Now, FileName = fileName }
            };

            StudentUpload newUpload = new StudentUpload
            {
                ActiveVersion = 0,
                Email = email,
                Course = course,
                Title = title,
                UploadDate = DateTime.Now,
                Versions = versions,
                Status = Status.underReview, // označi kao rad koji čeka analizu
            };

            return await _uploadDatabase.AddUpload(newUpload);
        }

        public async Task<StudentUpload> GetStudentUpload(string id)
        {
            var work = await _uploadDatabase.GetUpload(id);
            return work == null ? null : work;
        }

        public async Task<bool> RevertVersion(string id, int version)
        {
            var upload = await _uploadDatabase.GetUpload(id);
            if (upload == null || upload.Versions == null || version < 0 || version >= upload.Versions.Count)
                return false;

            if (upload.Review != null)
                upload.Versions[upload.ActiveVersion].Review = upload.Review;

            upload.ActiveVersion = version;
            var chosenVersion = upload.Versions[version];

            upload.UploadDate = chosenVersion.UploadedAt;
            var baseTitle = upload.Title.Split(" v")[0];
            upload.Title = version == 0 ? baseTitle : $"{baseTitle} v{version }";

            if (string.IsNullOrEmpty(chosenVersion.FileName))
            {
                var ext = ".unknown";
                var previous = upload.Versions.FirstOrDefault(v => !string.IsNullOrEmpty(v.FileName));
                if (previous != null)
                    ext = System.IO.Path.GetExtension(previous.FileName);
                chosenVersion.FileName = $"{baseTitle.Replace(" ", "")}{version}{ext}";
            }
            if (chosenVersion.Review != null)
            {
                upload.Review = chosenVersion.Review;

                if (chosenVersion.Review.Grade == 0 &&
                    !string.IsNullOrEmpty(chosenVersion.Review.Errors) &&
                    chosenVersion.Review.Errors.Contains("Error during AI analysis"))
                {
                    upload.Status = Status.Rejected;
                }
                else
                {
                    upload.Status = Status.FeedbackReady;
                }
            }
            else
            {
                upload.Review = null;
                upload.Status = Status.underReview;
                upload.UsualReviewTime = null;
            }

            var success = await _uploadDatabase.UpdateUpload(upload.Id, upload);
            return success;
        }

        public async Task<bool> UpdateUpload(byte[] file, string uploadId)
        {
            var upload = await _uploadDatabase.GetUpload(uploadId);
            if (upload == null) return false;

            var baseTitle = upload.Title.Split(" v")[0];
            var newVersionNumber = upload.Versions.Count;
            var previous = upload.Versions.FirstOrDefault(v => !string.IsNullOrEmpty(v.FileName));
            var ext = previous != null ? System.IO.Path.GetExtension(previous.FileName) : ".unknown";

            var newVersion = new UploadVersion
            {
                VersionNumber = newVersionNumber,
                File = file,
                UploadedAt = DateTime.UtcNow,
                FileName = $"{baseTitle.Replace(" ", "")}{newVersionNumber}{ext}"
            };

            upload.Versions.Add(newVersion);
            upload.ActiveVersion = newVersionNumber;
            upload.Title = $"{baseTitle} v{newVersionNumber }";
            upload.UploadDate = newVersion.UploadedAt;
            upload.Status = Status.underReview;
            upload.UsualReviewTime = null;
            upload.Review = null;

            var success = await _uploadDatabase.UpdateUpload(upload.Id, upload);
            return success;
        }

        public async Task<List<StudentUpload>> GetAllStudentUploads(string email)
        {
            var uploads = await _uploadDatabase.GetStudentUploadsByEmail(email);
            return uploads == null || !uploads.Any() ? null : uploads;
        }

        public async Task<List<StudentUpload>> GetAllUploads()
        {
            var allUploads = await _uploadDatabase.GetAllUploads();
            return allUploads ?? new List<StudentUpload>();
        }

        public async Task<Review> GetReview(string uploadId)
        {
            var upload = await _uploadDatabase.GetUpload(uploadId);
            return upload?.Review;
        }

        public async Task<bool> ProfessorReview(string id, Review review)
        {
            var upload = await _uploadDatabase.GetUpload(id);
            if (upload == null) return false;

            upload.Review = review;

            var activeIndex = upload.ActiveVersion;
            if (upload.Versions != null && activeIndex < upload.Versions.Count)
                upload.Versions[activeIndex].Review = review;

            var success = await _uploadDatabase.UpdateUpload(upload.Id, upload);
            return success;
        }

        public async Task<bool> UpdateGrade(string uploadId, double grade)
            {
                        var upload = await _uploadDatabase.GetUpload(uploadId);

                        if (upload == null) return false;

                if (upload.Review == null)
                    upload.Review = new Review();

                upload.Review.Grade = grade;

            if (upload.Versions != null && upload.ActiveVersion >= 0 && upload.ActiveVersion < upload.Versions.Count)
            {
                if (upload.Versions[upload.ActiveVersion].Review == null)
                    upload.Versions[upload.ActiveVersion].Review = new Review();

                upload.Versions[upload.ActiveVersion].Review.Grade = grade;
            }

            return await _uploadDatabase.UpdateUpload(uploadId, upload);
            }


        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners() => this.CreateServiceRemotingReplicaListeners();
    }
}
