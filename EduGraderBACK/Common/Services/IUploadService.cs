using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services
{
    public interface IUploadService: IService
    {
        Task<bool> NewUpload(string email, byte[] file, string title, string course, string fileName);
        Task<bool> UpdateUpload(byte[] file, string uploadId);
        Task<bool> RevertVersion(string id, int version);
        Task<StudentUpload> GetStudentUpload(string id);

        Task<List<StudentUpload>> GetAllStudentUploads(string email);
        Task<List<StudentUpload>> GetAllUploads();


        Task<Review> GetReview(string id);

        Task<bool> ProfessorReview(string id, Review review);

        Task<bool> UpdateGrade(string uploadId, double grade);

    }
}
