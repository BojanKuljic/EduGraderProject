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

        [HttpPut("professor/review")]
        public async Task<IActionResult> ProfessorsWorkAnalysis([FromBody] Review review, [FromQuery] string uploadId)
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



    }
}
