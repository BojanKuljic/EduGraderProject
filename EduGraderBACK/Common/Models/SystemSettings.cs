using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson.Serialization.Attributes;


namespace Common.Models
{

    [BsonIgnoreExtraElements]
    public class SystemSettings
    {
        public string AnalysisMethod { get; set; }
        public string EvaluationStyle { get; set; }
        public string Language { get; set; }
        public int MaxUploads { get; set; }
        public string Period { get; set; }
    }
}
