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
    public class AuthController : ControllerBase
    {
        private readonly IAllUsersService _allUserService = ServiceProxy.Create<IAllUsersService>(new Uri("fabric:/EduGraderSystem/AllUsersService"), new ServicePartitionKey(0), TargetReplicaSelector.PrimaryReplica);


        [HttpPost("signup")]
        public async Task<IActionResult> Register([FromForm] Register request)
        {
            var result = await _allUserService.Register(request);
            return result ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] Login request)
        {
            var user = await _allUserService.Login(request);
            if (user == null) return Unauthorized("Invalid credentials");

            var isRestricted = await _allUserService.IsUserRestricted("login", user.email);
            return isRestricted ? Unauthorized("User login is restricted") : Ok(user);
        }

    }
}
