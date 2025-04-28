using Common.Models;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;

namespace Common.Requests
{
    public class UploadRequest
    {
        public string email { get; set; }
        public string course { get; set; }
        public string title { get; set; }

        public DateTime UploadDate = DateTime.Now;

        public IFormFile file { get; set; }
    }
}
