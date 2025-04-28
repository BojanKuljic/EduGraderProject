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
    public class AdminController : Controller
    {
        private readonly IAllUsersService _allUserService = ServiceProxy.Create<IAllUsersService>(new Uri("fabric:/EduGraderSystem/AllUsersService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);
        private readonly IUploadService _uploadService = ServiceProxy.Create<IUploadService>(new Uri("fabric:/EduGraderSystem/UploadService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);

        [HttpPost("admin/restrict")]
        public async Task<IActionResult> AddUserRestriction([FromBody] RestrictionForm request)
        {
            var result = await _allUserService.AddUserRestriction(request.restriction, request.email);
            return result ? Ok() : BadRequest();
        }

        [HttpPost("admin/unrestrict")]
        public async Task<IActionResult> RemoveUserRestriction([FromBody] RestrictionForm request)
        {
            var result = await _allUserService.RemoveUserRestriction(request.restriction, request.email);
            return result ? Ok() : BadRequest();
        }


        [HttpPut("admin/role/{email}")]
        public async Task<IActionResult> ChangeUserRole(string email, [FromBody] string newRole)
        {
            var result = await _allUserService.ChangeUserRole(email, newRole);
            if (!result) return BadRequest("Unable to change user role");
            return NoContent();
        }

        [HttpDelete("admin/delete/{email}")]
        public async Task<IActionResult> DeleteUser(string email)
        {
            var result = await _allUserService.DeleteUser(email);
            if (!result) return BadRequest("Unable to delete user");
            return NoContent();
        }


    }
}