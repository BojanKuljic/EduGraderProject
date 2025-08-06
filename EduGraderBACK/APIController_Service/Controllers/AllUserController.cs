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
    public class AllUserController : ControllerBase
    {
        private readonly IAllUsersService _allUserService = ServiceProxy.Create<IAllUsersService>(new Uri("fabric:/EduGraderSystem/AllUsersService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);

        [HttpGet("getUser/{email}")]
        public async Task<ActionResult<User>> GetUser(string email)
        {
            var user = await _allUserService.GetUserByEmail(email);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpGet("getAllUsers")]
        public async Task<ActionResult<IEnumerable<User>>> GetAllStudents()
        {
            var students = await _allUserService.GetAllStudents();
            return Ok(students);
        }


        [HttpGet("user/{email}/restrictions")]
        public async Task<IActionResult> GetUserRestrictions(string email)
        {
            var restrictions = await _allUserService.GetUserRestrictions(email);
            if (restrictions == null) return NotFound();
            return Ok(restrictions);
        }



    }
}

