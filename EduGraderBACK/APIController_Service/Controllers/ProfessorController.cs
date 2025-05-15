using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Communication.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;

namespace APIController_Service.Controllers
{
    [Route("/")]
    [ApiController]
    public class ProfessorController : Controller
    {
        private readonly IUploadService _uploadService = ServiceProxy.Create<IUploadService>(new Uri("fabric:/EduGraderSystem/UploadService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);
        private readonly IProgressService _progressService = ServiceProxy.Create<IProgressService>(new Uri("fabric:/EduGraderSystem/ProgressService"));

        [HttpPut("professor/review")]
        public async Task<IActionResult> ProfessorsAnalysis([FromBody] Review review, [FromQuery] string uploadId)
        {

            if (review == null || string.IsNullOrEmpty(uploadId))
            {
                return BadRequest("Invalid request data.");
            }
            var result = await _uploadService.ProfessorReview(uploadId, review);

            if (result == null)
                return BadRequest("Error updating review.");

            return Ok();
        }

        [HttpPut("professor/commonMistakeReport")]
        public async Task<IActionResult> ProfessorsReport()
        {
            var result = await _progressService.FindMostCommonMistakes();

            if (result == null)
                return BadRequest("Error updating review.");

            return Ok(result);
        }

        [HttpGet("professor/averageGrade")]
        public async Task<IActionResult> GetAverageGrade()
        {
            double avgGrade = await _progressService.CalculateAverageGrade();
            return Ok(avgGrade);
        }

        [HttpGet("professor/gradeTimeline")]
        public async Task<IActionResult> GetGradeTimeline()
        {
            var result = await _progressService.GetAllGradesWithTimestamps();
            if (result == null)
                return BadRequest("Could not retrieve timeline.");

            return Ok(result);
        }

    }
}
