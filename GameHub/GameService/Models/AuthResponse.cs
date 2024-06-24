namespace GameService.Models
{
	public class AuthResponse
	{
		public AuthResponse() { }

		public string access_token { get; set; }
		public int expires_in { get; set; }
		public string token_type { get; set; }
    }
}

