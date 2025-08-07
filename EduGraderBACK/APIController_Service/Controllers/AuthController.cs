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
            if (string.IsNullOrWhiteSpace(request.name))
                return BadRequest("Full name is required.");

            if (string.IsNullOrWhiteSpace(request.email))
                return BadRequest("Email is required.");

            if (string.IsNullOrWhiteSpace(request.password))
                return BadRequest("Password is required.");

            if (string.IsNullOrWhiteSpace(request.role))
                return BadRequest("Role is required.");

            // Provera da li već postoji korisnik sa istim emailom
            var existingUser = await _allUserService.GetUserByEmail(request.email);
            if (existingUser != null)
                return BadRequest("A user with this email already exists.");

            var result = await _allUserService.Register(request);
            return result ? Ok(result) : BadRequest("Registration failed.");
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromForm] Login request)
        {
            if (string.IsNullOrEmpty(request.email) )
                return BadRequest("Email is required.");
            if ( string.IsNullOrEmpty(request.password))
                return BadRequest("Password is required.");
            if ( string.IsNullOrEmpty(request.role))
                return BadRequest("Role is required.");

            var user = await _allUserService.GetUserByEmail(request.email);
            if (user == null)
                return Unauthorized("Incorrect email address.");

            if (user.password != request.password)
                return Unauthorized("Incorrect password.");

            if (!string.Equals(user.role, request.role, StringComparison.OrdinalIgnoreCase))
                return Unauthorized("Selected role does not match your account.");

            var isRestricted = await _allUserService.IsUserRestricted("login", user.email);
            if (isRestricted)
                return Unauthorized("User login is restricted.");

            return Ok(user);
        }
    }
}
