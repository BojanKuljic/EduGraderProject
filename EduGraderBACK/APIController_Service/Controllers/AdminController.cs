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
    public class AdminController : Controller
    {
        private readonly IAllUsersService _allUserService = ServiceProxy.Create<IAllUsersService>(new Uri("fabric:/EduGraderSystem/AllUsersService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);
        private readonly IUploadService _uploadService = ServiceProxy.Create<IUploadService>(new Uri("fabric:/EduGraderSystem/UploadService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);
        [HttpPost("admin/restrict")]
        public async Task<IActionResult> AddUserRestriction([FromBody] RestrictionForm request)
        {
            if (request == null)
            {
                Console.WriteLine(" RestrictionForm is NULL!");
                return BadRequest("RestrictionForm is null or invalid.");
            }

            Console.WriteLine($" [RESTRICT] Email: {request.email}, Restriction: {request.restriction}");

            var result = await _allUserService.AddUserRestriction(request.restriction, request.email);
            return result ? Ok() : BadRequest("Failed to add restriction.");
        }

        [HttpPost("admin/unrestrict")]
        public async Task<IActionResult> RemoveUserRestriction([FromBody] RestrictionForm request)
        {
            if (request == null)
            {
                Console.WriteLine(" RestrictionForm is NULL!");
                return BadRequest("RestrictionForm is null or invalid.");
            }

            Console.WriteLine($" [UNRESTRICT] Email: {request.email}, Restriction: {request.restriction}");

            var result = await _allUserService.RemoveUserRestriction(request.restriction, request.email);
            return result ? Ok() : BadRequest("Failed to remove restriction.");
        }

        [HttpPost("admin/set-restrictions")]
        public async Task<IActionResult> SetRestrictions([FromBody] RestrictionRequest request)
        {
            var result = await _allUserService.SetUserRestrictions(request.email, request.restrictions);
            if (!result) return BadRequest("Failed to set restrictions");
            return Ok();
        }

        [HttpPost("admin/remove-all-restrictions")]
        public async Task<IActionResult> RemoveAllRestrictions([FromBody] RestrictionForm request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.email))
                return BadRequest("Invalid request. Don`t restrictions for user!");

            var result = await _allUserService.RemoveAllRestrictions(request.email);
            if (!result) return BadRequest("Failed to remove all restrictions");
            return Ok();
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

        [HttpGet("admin/all-users")]
        public async Task<IActionResult> GetAllSystemUsers()
        {
            var users = await _allUserService.GetAllSystemUsers();
            return Ok(users);
        }

        [HttpPut("admin/update/{email}")]
        public async Task<IActionResult> UpdateUser(string email, User user)
        {
            var result = await _allUserService.UpdateUser(email, user);
            if (!result) return BadRequest("Unable to update user!");
            return NoContent();
        }

    }
}