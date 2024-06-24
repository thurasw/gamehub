using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace UserService.Models
{
    public class ResetPasswordModel
    {
        public string Password { get; set; }

        public string Username { get; set; }

        public int Pin { get; set; }
    }
}
