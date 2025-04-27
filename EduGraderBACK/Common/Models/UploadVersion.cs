using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class UploadVersion
    {
        [BsonElement("versionNumber")]
        public int VersionNumber { get; set; }

        [BsonElement("fileUrl")]
        public string FileUrl { get; set; }

        [BsonElement("uploadedAt")]
        public DateTime UploadedAt { get; set; }
    }
}
