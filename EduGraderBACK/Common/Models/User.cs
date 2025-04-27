using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Bson;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }
        [BsonElement("name")]
        public string name { get; set; }
        [BsonElement("email")]
        public string email { get; set; }
        [BsonElement("password")]
        public string password { get; set; }
        [BsonElement("role")]
        public string role { get; set; }
        [BsonElement("restrictions")]
        public List<string> restrictions { get; set; }
    }
}
