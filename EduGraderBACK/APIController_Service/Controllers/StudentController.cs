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

       // private readonly BlobStorageService _blobStorageService = new BlobStorageService();
        private readonly IUploadService _uploadService = ServiceProxy.Create<IUploadService>(new Uri("fabric:/EduGraderSystem/UploadService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);
        private readonly IAllUsersService _allUserService = ServiceProxy.Create<IAllUsersService>(new Uri("fabric:/EduGraderSystem/AllUsersService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);

        [HttpPost("student/upload")]
        public async Task<IActionResult> UploadWork([FromForm] UploadRequest upload)
        {
            //var isRestricted = await _allUserService.IsUserRestricted("upload", work.studentId);
            //if (isRestricted) return Unauthorized(new ResultMessage(false, "User submittions restricted"));

            IFormFile file = upload.file;
            if (file == null || file.Length == 0)
                return BadRequest("Invalid file");

            byte[] fileBytes;

            using (var memoryStream = new MemoryStream())
            {
                await file.CopyToAsync(memoryStream);
                fileBytes = memoryStream.ToArray();
            }
            // using var stream = file.OpenReadStream();
            // var fileUrl = await _blobStorageService.UploadFileAsync(stream, file.FileName, file.ContentType);

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

            //using var stream = file.OpenReadStream();
            //var fileUrl = await _blobStorageService.UploadFileAsync(stream, file.FileName, file.ContentType);
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


    }
}
