using Common.Models;
using Common.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;

namespace APIController_Service.Controllers
{
    [Route("admin/system-settings")]
    [ApiController]
    public class SystemSettingsController : ControllerBase
    {
        private readonly IGradeAndAnalysesService _analysisService = ServiceProxy.Create<IGradeAndAnalysesService>(
            new Uri("fabric:/EduGraderSystem/GradeAndAnalysesService"),
            new ServicePartitionKey(0)
        );

        [HttpGet]
        public async Task<IActionResult> GetSettings()
        {
            var settings = await _analysisService.GetSystemSettings();
            return Ok(settings);
        }

        [HttpPost]
        public async Task<IActionResult> SetSettings([FromBody] SystemSettings settings)
        {
            var success = await _analysisService.SetSystemSettings(settings);
            return success ? Ok() : BadRequest("Failed to update settings.");
        }
    }

}
