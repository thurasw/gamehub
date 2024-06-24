using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Security.Cryptography;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace UserService.Models
{
    public class Account
    {
        public long Id { get; set; }

        [Required]
        public string Username { get; set; }

        [Required]
        public string Email { get; set; }

        [Required]
        public string DateOfBirth { get; set; }

        [JsonIgnore]
        [Required]
        public byte[] Salt { get; set; }

        [JsonIgnore]
        [Required]
        public string HashedPassword { get; set; }

        public bool Admin { get; set; }

        public bool Verified { get; set; }

        public int Pin { get; set; }
    }
}
