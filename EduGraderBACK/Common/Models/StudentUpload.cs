using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class StudentUpload
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        [BsonElement("email")]
        public string email { get; set; }

        [BsonElement("course")]
        public string Course { get; set; }

        [BsonElement("title")]
        public string Title { get; set; }

        [BsonElement("versions")]
        public List<UploadVersion> Versions { get; set; } = new List<UploadVersion>();

        [BsonElement("activeVersion")]
        public uint activeVersion { get; set; }

        [BsonElement("status")]
        public Status Status { get; set; }

        [BsonElement("uploadDate")]
        public DateTime UploadDate { get; set; }

        [BsonElement("usualReviewTime")]
        public DateTime? usualReviewTime { get; set; }

        [BsonElement("reiew")]
        public Review Review { get; set; }
    }

    public enum Status
    {
        underReview,
        FeedbackReady,
        Rejected
    }
}
