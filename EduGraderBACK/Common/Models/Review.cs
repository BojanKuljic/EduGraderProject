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
        public List<string> Improvements { get; set; } 

        [BsonElement("recommendations")]
        public List<string> Recommendations { get; set; }
    }
}
