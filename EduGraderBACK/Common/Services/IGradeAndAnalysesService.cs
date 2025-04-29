using Common.Models;
using Microsoft.ServiceFabric.Services.Remoting;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Services
{
    public interface IGradeAndAnalysesService : IService
    {
        Task<Review> AnalyzeWork(StudentUpload studentWorkDto);
        Task<bool> SetPrompts(string errorPrompt, string improvementPrompt, string scorePrompt);
        Task<Dictionary<string, string>> GetPrompts();
    }
}
