using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ReviewService.Data;
using ReviewService.Models;

namespace ReviewService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        private readonly ReviewServiceContext _context;

        public ReviewsController(ReviewServiceContext context)
        {
            _context = context;
        }

        // GET: api/Reviews/5
        [HttpGet("game/{gameSlug}")]
        public async Task<ActionResult<IEnumerable<Review>>> GetReview(string gameSlug)
        {
            return await _context.Review.Where(r => r.GameSlug == gameSlug).ToListAsync();
        }

        // PUT: api/Reviews/5
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPut("{id}")]
        public async Task<IActionResult> PutReview(long id, Review review)
        {
            if (id != review.Id)
            {
                return Ok(new { edit = false });
            }

            Review r = _context.Review.Find(id);
            if (r == null)
            {
                return Ok(new { edit = false });
            }

            var token = Request.Cookies["auth"];
            (string username, string role) = GetUserFromToken(token);

            if (Authenticate(token) == true && (username == r.Username || role == "admin"))
            {
                char[] takeWhiteSpaceSeparators = null;
                int wordCount = review.ReviewText.Split(takeWhiteSpaceSeparators, StringSplitOptions.RemoveEmptyEntries).Length;
                if (wordCount > 200)
                {
                    return Ok(new { edit = "word-count" });
                }
                r.Rating = review.Rating;
                r.ReviewText = review.ReviewText;
                r.DatePosted = DateTime.Now.ToString("d MMM yyyy");

                _context.Entry(r).State = EntityState.Modified;
                try
                {
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!ReviewExists(id))
                    {
                        return Ok(new { edit = false });
                    }
                    else
                    {
                        return Ok(new { edit = false });
                    }
                }
                return Ok(new { edit = true });
            }
            else
            {
                return Ok(new { edit = false });
            }
        }

        public async Task<ActionResult<IEnumerable<Review>>> GetReview()
        {
            return await _context.Review.ToListAsync();
        }

        // POST: api/Reviews
        // To protect from overposting attacks, enable the specific properties you want to bind to, for
        // more details, see https://go.microsoft.com/fwlink/?linkid=2123754.
        [HttpPost]
        public async Task<IActionResult> PostReview(Review review)
        {
            var token = Request.Cookies["auth"];
            (string username, _) = GetUserFromToken(token);

            if (Authenticate(token) == true && username != "")
            {
                char[] takeWhiteSpaceSeparators = null;
                int wordCount = review.ReviewText.Split(takeWhiteSpaceSeparators, StringSplitOptions.RemoveEmptyEntries).Length;
                if (wordCount > 200)
                {
                    return Ok(new { reason = "word-count" });
                }

                Review r = new Review
                {
                    GameSlug = review.GameSlug,
                    Username = username,
                    Rating = review.Rating,
                    ReviewText = review.ReviewText,
                    DatePosted = DateTime.Now.ToString("d MMM yyyy")
                };
                _context.Review.Add(r);
                await _context.SaveChangesAsync();

                return CreatedAtAction("GetReview", new { id = r.Id }, r);
            }
            else
            {
                return Ok(new { reason = "login" });
            }
        }
        
        [HttpPost("report/{reviewId}")]
        public async Task<ActionResult<Review>> PostReview(long reviewId, Report report)
        {
            var review = _context.Review.Include(r => r.Reports).SingleOrDefault(r => r.Id == reviewId);

            if (review == null)
            {
                return NoContent();
            }
            else
            {
                report.DateReported = DateTime.Now.ToString("dd/MM/yyyy h:mm tt");
                if (review.Reports.Any(r => r.ReviewText == report.ReviewText))
                {
                    return Ok(new { report = true });
                }
                else
                {
                    review.Reports.Add(report);
                    try
                    {
                        await _context.SaveChangesAsync();
                        return Ok(new { report = true });
                    }
                    catch
                    {
                        return NoContent();
                    }
                }
            }
        }
        [HttpGet("report")]
        public async Task<IActionResult> GetReports()
        {
            var token = Request.Cookies["auth"];
            (_, string role) = GetUserFromToken(token);

            if (Authenticate(token) == true && role == "admin")
            {
                var reports = await _context.Review.Select(r => new { r.Id, r.Reports }).ToListAsync();
                return Ok(reports);
            }
            else
            {
                return NoContent();
            }
        }
        [HttpDelete("report/{reviewId}")]
        public async Task<IActionResult> DeleteReport(long reviewId)
        {
            var review = _context.Review.Include(r => r.Reports).SingleOrDefault(r => r.Id == reviewId);

            if (review == null)
            {
                return NoContent();
            }
            else
            {
                var token = Request.Cookies["auth"];
                (_, string role) = GetUserFromToken(token);

                if (Authenticate(token) == true && role == "admin")
                {
                    review.Reports.Clear();
                    try
                    {
                        await _context.SaveChangesAsync();
                        return Ok(new { delete = true });
                    }
                    catch
                    {
                        return Ok(new { delete = false });
                    }
                }
                else
                {
                    return NoContent();
                }
                
            }
        }

        // DELETE: api/Reviews/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReview(long id)
        {
            var review = await _context.Review.Include(r => r.Reports).SingleOrDefaultAsync(r => r.Id == id);
            if (review == null)
            {
                return Ok(new { delete = false });
            }

            var token = Request.Cookies["auth"];
            (string username, string role) = GetUserFromToken(token);

            if (Authenticate(token) == true && (username == review.Username || role == "admin"))
            {
                _context.Review.Remove(review);
                await _context.SaveChangesAsync();
                return Ok(new { delete = true });
            }

            return Ok(new { delete = false });
        }

        private bool ReviewExists(long id)
        {
            return _context.Review.Any(e => e.Id == id);
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
