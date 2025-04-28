using Common.Models;
using Common.Requests;
using Common.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Communication.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;

namespace APIController_Service.Controllers
{

    [Route("/")]
    [ApiController]
    public class StudentController : Controller
    {

        private readonly IUploadService _uploadService = ServiceProxy.Create<IUploadService>(new Uri("fabric:/EduGraderSystem/UploadService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);
        //private readonly IAllUsersService _allUserService = ServiceProxy.Create<IAllUsersService>(new Uri("fabric:/EduGraderSystem/AllUsersService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);

        [HttpPost("student/upload")]
        public async Task<IActionResult> UploadWork([FromForm] UploadRequest upload)
        {
            IFormFile file = upload.file;
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file");

            byte[] fileBytes;

            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                fileBytes = memoryStream.ToArray();
            }

            var result = await _uploadService.NewUpload(upload.email, fileBytes, upload.title, upload.course);
            return result ? Ok("Sucessfuly uploaded") : BadRequest("Unable to upload");
        }
        [HttpGet("student/getUplad/{uploadId}")]
        public async Task<ActionResult<StudentUpload>> GetStudentWork(string uploadId)
        {
            var work = await _uploadService.GetStudentUpload(uploadId);
            return work != null ? Ok(work) : NotFound("No work found for the given id.");
        }

        [HttpPut("student/update")]
        public async Task<IActionResult> UpdateWork([FromForm] IFormFile file, [FromQuery] string uploadId)
        {
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file.");

            byte[] fileBytes;

            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                fileBytes = memoryStream.ToArray();
            }

            var result = await _uploadService.UpdateUpload(fileBytes, uploadId);

            return result ? Ok("Upload updated sucessfully") : BadRequest("Failed to update");
        }

        [HttpPut("student/changeVersion")]
        public async Task<IActionResult> RevertVersion([FromQuery] string? uploadId, [FromQuery] int? verison)
        {
            if (uploadId == null || verison == null)
                return BadRequest("Invalid parameters.");


            var result = await _uploadService.RevertVersion(uploadId, verison.Value);

            return result ? Ok("Upload updated sucessfully") : BadRequest("Failed to change version");
        }


        [HttpGet("student/{email}/allUploads")]
        public async Task<ActionResult<IEnumerable<StudentUpload>>> GetWorksOfStudent(string email)
        {
            var statuses = await _uploadService.GetAllStudentUploads(email);
            return statuses != null ? Ok(statuses) : NotFound("No uploads found for the given student.");
        }

        [HttpGet("upload/{uploadId}/review")]
        public async Task<ActionResult<Review>> GetReview(string uploadId)
        {
            var feedback = await _uploadService.GetReview(uploadId);
            return feedback != null ? Ok(feedback) : NotFound("Review not available for this work.");
        }

    }
}
