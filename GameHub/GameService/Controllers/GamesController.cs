using System;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using GameService.Services;

namespace GameService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class GamesController : ControllerBase
    {
        private readonly APIService _apiService;

        public GamesController(APIService apiService) =>
            _apiService = apiService;

        [HttpGet("search/{query}")]
        public async Task<IActionResult> Search(string query)
        {
            string msg = "fields cover.*, aggregated_rating, first_release_date, genres.*, slug, name; search \"" + query + "\"; where version_parent = null & name != null;";
            try
            {
                string response = await _apiService.FetchData("games", msg);
                return Ok(response);
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("API Error: {0}", e.Message);
                return Problem("Internal Server Error", null, 500);
            }
        }
        [HttpGet("name/{slug}")]
        public async Task<IActionResult> GetGameBySlug(string slug)
        {
            string msg = "fields aggregated_rating, aggregated_rating_count, external_games.category, external_games.uid, external_games.url, involved_companies.company.name, involved_companies.developer, involved_companies.publisher, artworks.image_id, category, collection.games.name, collection.name, collection.games.cover.image_id, collection.games.slug, cover.image_id, dlcs.cover.image_id, dlcs.slug, dlcs.name, first_release_date, name, platforms.abbreviation, platforms.slug, similar_games.name, similar_games.cover.image_id, similar_games.slug, slug, storyline, summary, version_title, screenshots.image_id,  videos.video_id, videos.name, themes.name, themes.slug; where slug = \"" + slug + "\";";
            try
            {
                string response = await _apiService.FetchData("games", msg);
                return Ok(response);
            }
            catch (HttpRequestException e)
            {

                Console.WriteLine("API Error: {0}", e.Message);
                return Problem("Internal Server Error", null, 500);
            }
        }
        [HttpGet("trending")]
        public async Task<IActionResult> GetTrendingGames()
        {
            string msg = "fields cover.*, aggregated_rating, first_release_date, genres.*, slug, name; where hypes >= 85 & themes != 42; sort first_release_date desc; limit 18;";
            try
            {
                string response = await _apiService.FetchData("games", msg);
                return Ok(response);
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("API Error: {0}", e.Message);
                return Problem("Internal Server Error", null, 500);
            }
        }
    }
}
