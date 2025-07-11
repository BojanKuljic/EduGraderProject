﻿using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services
{
    public interface IProgressService : IService
    {
        Task<UploadProgress> GenerateStudentProgress(string email, List<StudentUpload> studentWorks);
        Task<List<string>> FindMostCommonMistakes();
        Task<double> CalculateAverageGrade();
        Task<List<(DateTime Timestamp, double Grade)>> GetAllGradesWithTimestamps();
    }
}
