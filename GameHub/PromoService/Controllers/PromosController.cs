using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using PromoService.Data;
using PromoService.Models;

namespace PromoService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PromosController : ControllerBase
    {
        private readonly PromoServiceContext _context;

        public PromosController(PromoServiceContext context)
        {
            _context = context;
        }

        // GET: api/Promoes
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Promo>>> GetPromo()
        {
            return await _context.Promo.ToListAsync();
        }

        // POST: api/Promoes
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<ActionResult<Promo>> PostPromo(IFormCollection data)
        {
            var token = Request.Cookies["auth"];
            (_, string role) = GetUserFromToken(token);

            if (Authenticate(token) == true && role == "admin")
            {
                try
                {
                    foreach (IFormFile file in data.Files)
                    {
                        string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", data["gameSlug"] + "-" + file.FileName);
                        using Stream stream = new FileStream(path, FileMode.Create);
                        file.CopyTo(stream);
                    }

                    Promo promo = new Promo
                    {
                        Name = data["name"],
                        GameSlug = data["gameSlug"],
                        Background = data.Files["background"].FileName,
                        Banner = data.Files["banner"].FileName,
                        Character = data.Files["character"].FileName
                    };
                    _context.Promo.Add(promo);
                    await _context.SaveChangesAsync();

                    return CreatedAtAction("GetPromo", new { id = promo.Id }, promo);
                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                    return new StatusCodeResult(StatusCodes.Status500InternalServerError);
                }
            }
            else
            {
                return NotFound();
            }
            
        }

        // DELETE: api/Promoes/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePromo(long id)
        {
            var token = Request.Cookies["auth"];
            (_, string role) = GetUserFromToken(token);

            if (Authenticate(token) == true && role == "admin")
            {
                var promo = await _context.Promo.FindAsync(id);
                if (promo == null)
                {
                    return Ok();
                }

                try
                {
                    string path = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", promo.GameSlug + "-");
                    System.IO.File.Delete(path + promo.Banner);
                    System.IO.File.Delete(path + promo.Background);
                    System.IO.File.Delete(path + promo.Character);

                    _context.Promo.Remove(promo);
                    await _context.SaveChangesAsync();

                    return Ok();
                }
                catch
                {
                    _context.Promo.Remove(promo);
                    await _context.SaveChangesAsync();

                    return Ok();
                }
            }
            else
            {
                return NotFound();
            }
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
                var secretKey = new SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes("IXiL8jLUVkTpsuD7sU2e"));
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
    }
}
