using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Common.Requests
{
    public class Login
    {
        public string email { get; set; }
        public string password { get; set; }

        public string role { get; set; }
    }
}
