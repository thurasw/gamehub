using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using UserService.Data;
using UserService.Models;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Cryptography;
using Microsoft.AspNetCore.Cryptography.KeyDerivation;
using MimeKit;
using MailKit.Net.Smtp;

namespace UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly UserServiceContext _context;

        public AccountsController(UserServiceContext context)
        {
            _context = context;
        }

        // POST: api/Accounts
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost("register")]
        public async Task<ActionResult<Account>> PostAccount([FromBody] SignupModel signupModel, bool persist)
        {
            if (_context.Account.Any(a => a.Username == signupModel.Username))
            {
                return Ok(new { error = "Username taken" });
            }
            else if (_context.Account.Any(a => a.Email == signupModel.Email))
            {
                return Ok(new { error = "An account with the specified email exists" });
            }

            var salt = GetSalt();
            int pin = SendVerifyEmail(signupModel.Email, signupModel.Username);

            var account = new Account{ 
                Username = signupModel.Username,
                Email = signupModel.Email,
                DateOfBirth = signupModel.DateOfBirth,
                HashedPassword = HashPassword(signupModel.Password, salt),
                Salt = salt,
                Admin = false,
                Verified = false,
                Pin = pin
            };
            _context.Account.Add(account);
            await _context.SaveChangesAsync();

            return Ok(new { auth = true });
        }

        [HttpGet("verify")]
        public async Task<IActionResult> Verify(string username, int pin, bool persist)
        {
            Account account = _context.Account.SingleOrDefault(a => a.Username == username);
            if (account == null)
            {
                return Ok(new { verify = false });
            }
            else
            {
                if (account.Pin == pin)
                {
                    _context.Entry(account).State = EntityState.Modified;
                    account.Verified = true;
                    try
                    {
                        await _context.SaveChangesAsync();

                        var token = GetToken(account.Username, account.Admin);

                        var cookieString = "auth=" + token + "; SameSite=Strict; HttpOnly; Path=/gateway;";
                        if (persist)
                        {
                            cookieString += " Max-Age=31536000;";
                        }

                        Response.Headers.Add("Set-Cookie", cookieString);
                        return Ok(new { verify = true });
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        return NoContent();
                    }
                }
                else
                {
                    return Ok(new { verify = false });
                }
            }
        }
        [HttpGet("email")]
        public async Task<IActionResult> SendEmail(string username)
        {
            Account account = _context.Account.SingleOrDefault(a => a.Username == username);
            if (account == null)
            {
                return NoContent();
            }
            else
            {
                int pin = SendVerifyEmail(account.Email, account.Username);
                _context.Entry(account).State = EntityState.Modified;
                account.Pin = pin;

                try
                {
                    await _context.SaveChangesAsync();
                    return Ok(new { email = true });
                }
                catch (DbUpdateConcurrencyException)
                {
                    return NoContent();
                }
            }
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginModel user, bool persist)
        {
            if (user == null)
            {
                return NoContent();
            }

            var account = _context.Account.SingleOrDefault(a => a.Username == user.Username);

            if (account != null)
            {
                var hashedPassword = HashPassword(user.Password, account.Salt);

                if (_context.Account.Any(e => e.Username == user.Username && e.HashedPassword == hashedPassword))
                {
                    if (account.Verified == false)
                    {
                        return Ok(new { auth = false });
                    }
                    else
                    {
                        var token = GetToken(user.Username, account.Admin);

                        var cookieString = "auth=" + token + "; SameSite=Strict; HttpOnly; Path=/gateway;";
                        if (persist)
                        {
                            cookieString += " Max-Age=31536000;";
                        }
                        Response.Headers.Add("Set-Cookie", cookieString);
                        return Ok(new { auth = true });
                    }
                }
                else
                {
                    return NoContent();
                }
            }
            else
            {
                return NoContent();
            }
        }

        [HttpGet("auth")]
        public IActionResult Authenticate()
        {
            var token = Request.Cookies["auth"];
            if (Authenticate(token) == true)
            {
                (string user, string role) = GetUserFromToken(token);
                return Ok(new { user, role });
            }
            else
            {
                return Ok(new { user = false });
            }
        }

        //GET: api/Accounts/logout
        [HttpGet("logout")]
        public IActionResult Logout()
        {
            var cookieString = "auth=invalid; Max-Age=31536000; SameSite=Strict; HttpOnly; Path=/gateway;";
            Response.Headers.Add("Set-Cookie", cookieString);
            return Ok(new { auth = true });
        }

        [HttpGet("reset-pw/email")]
        public async Task<IActionResult> SendPwResetEmail(string email)
        {
            Account account = _context.Account.SingleOrDefault(a => a.Email == email);
            if (account == null)
            {
                return NoContent();
            }
            else
            {
                int pin = SendVerifyEmail(account.Email, account.Username);
                _context.Entry(account).State = EntityState.Modified;
                account.Pin = pin;

                try
                {
                    await _context.SaveChangesAsync();
                    return Ok(new { user = account.Username });
                }
                catch (DbUpdateConcurrencyException)
                {
                    return NoContent();
                }
            }
        }
        [HttpPost("reset-pw/reset")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordModel data)
        {
            Account account = _context.Account.SingleOrDefault(a => a.Username == data.Username);
            if (account == null)
            {
                return NoContent();
            }
            else
            {
                if (account.Pin == data.Pin)
                {
                    var salt = GetSalt();
                    var hashedPassword = HashPassword(data.Password, salt);

                    _context.Entry(account).State = EntityState.Modified;
                    account.Salt = salt;
                    account.HashedPassword = hashedPassword;

                    try
                    {
                        await _context.SaveChangesAsync();

                        var token = GetToken(account.Username, account.Admin);

                        var cookieString = "auth=" + token + "; SameSite=Strict; HttpOnly; Path=/gateway;";

                        Response.Headers.Add("Set-Cookie", cookieString);
                        return Ok(new { reset = true });
                    }
                    catch (DbUpdateConcurrencyException)
                    {
                        return NoContent();
                    }
                }
                else
                {
                    return Ok(new { reset = false });
                }
            }
        }

        // PUT: api/Accounts/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("edit")]
        public async Task<IActionResult> PutAccount([FromBody] String dateOfBirth)
        {
            var token = Request.Cookies["auth"];
            if (Authenticate(token) == true)
            {
                (string user, string role) = GetUserFromToken(token);

                var oldAccount = _context.Account.SingleOrDefault(a => a.Username == user);
                _context.Entry(oldAccount).State = EntityState.Modified;
                oldAccount.DateOfBirth = dateOfBirth;
                try
                {
                    await _context.SaveChangesAsync();
                    return Ok(new { update = true });
                }
                catch (DbUpdateConcurrencyException)
                {
                    return NoContent();
                }
            }
            else
            {
                return NoContent();
            }
        }

        // DELETE: api/Accounts/5
        [HttpDelete("")]
        public async Task<ActionResult<Account>> DeleteAccount()
        {
            var token = Request.Cookies["auth"];
            if (Authenticate(token) == true)
            {
                (string user, string role) = GetUserFromToken(token);

                var account = _context.Account.SingleOrDefault(a => a.Username == user);
                if (account == null)
                {
                    return NotFound();
                }

                _context.Account.Remove(account);
                await _context.SaveChangesAsync();

                return Ok(new { delete = true });
            }
            else
            {
                return NoContent();
            }
        }

        private byte[] GetSalt()
        {
            byte[] salt = new byte[128 / 8];
            using (var rng = RandomNumberGenerator.Create())
            {
                rng.GetBytes(salt);
            }
            return salt;
        }
        private string HashPassword(string password, byte[] salt)
        {
            string hashed = Convert.ToBase64String(KeyDerivation.Pbkdf2(
                    password: password,
                    salt: salt,
                    prf: KeyDerivationPrf.HMACSHA1,
                    iterationCount: 10000,
                    numBytesRequested: 256 / 8));
            return hashed;
        }

        private string GetToken(string username, bool admin)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("IXiL8jLUVkTpsuD7sU2e"));

            var role = admin ? "admin" : "user";

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[] { new Claim("user", username), new Claim("role", role) }),
                Expires = DateTime.UtcNow.AddYears(1),
                SigningCredentials = new SigningCredentials(secretKey, SecurityAlgorithms.HmacSha256),
                Issuer = "http://localhost:4200",
                Audience = "http://localhost:4200",
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);
            var tokenString = tokenHandler.WriteToken(token);

            return tokenString;
        }

        private bool Authenticate(string token) 
        {
            if (token == "invalid" || token == null)
            {
                return false;
            }
            try
            {
                var tokenHandler = new JwtSecurityTokenHandler();
                var secretKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("IXiL8jLUVkTpsuD7sU2e"));
                tokenHandler.ValidateToken(token, new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = secretKey,
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidIssuer = "http://localhost:4200",
                    ValidAudience = "http://localhost:4200",
                }, out SecurityToken validatedToken);

                return true;
            }
            catch
            {
                return false;
            }
        }
        private (string, string) GetUserFromToken(string token)
        {
            if (token == "invalid" || token == null)
            {
                return ("", "");
            }
            var tokenHandler = new JwtSecurityTokenHandler();
            var jsonToken = tokenHandler.ReadJwtToken(token);

            try
            {
                var user = jsonToken.Claims.First(claim => claim.Type == "user").Value;
                var role = jsonToken.Claims.First(claim => claim.Type == "role").Value;

                return (user, role);

            }
            catch
            {
                return ("", "");
            }
        }

        private int SendVerifyEmail(string email, string username)
        {
            MimeMessage message = new MimeMessage();

            MailboxAddress from = new MailboxAddress("Game Hub", "gamehub036@gmail.com");
            message.From.Add(from);
            MailboxAddress to = new MailboxAddress("User", email);
            message.To.Add(to);
            message.Subject = "Verification code for Game Hub";

            Random rnd = new Random();
            int pin = rnd.Next(100000, 999999);

            BodyBuilder bodyBuilder = new BodyBuilder();
            bodyBuilder.HtmlBody = "<p>Hey " + username + ", <br>Your verification code is " + pin + ".</p>";
            message.Body = bodyBuilder.ToMessageBody();

            SmtpClient client = new SmtpClient();
            client.Connect("smtp.gmail.com", 465, true);
            client.Authenticate("gamehub036@gmail.com", "lyMGlT8JlHvPVIEGJ784");

            client.Send(message);
            client.Disconnect(true);
            client.Dispose();

            return pin;
        }

    }
}