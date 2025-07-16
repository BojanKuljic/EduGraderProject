using MongoDB.Bson.Serialization.Attributes;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class Review
    {
        [BsonElement("grade")]
        public double Grade { get; set; }

        [BsonElement("errors")]
        public string Errors { get; set; } 

        [BsonElement("improvements")]
        public string Improvements { get; set; }

        [BsonIgnore] // ovo sprečava da se snima u Review dokument u bazi
        public long UsualReviewTime { get; set; }

        [BsonElement("recommendations")]
        public string Recommendations { get; set; }
    }
}
