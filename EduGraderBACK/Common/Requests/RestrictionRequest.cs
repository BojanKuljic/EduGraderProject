using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Requests
{
    public class RestrictionRequest
    {
        public string email { get; set; }
        public List<string> restrictions { get; set; }
    }
}
