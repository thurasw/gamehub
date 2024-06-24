using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using GameService.Models;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace GameService.Services
{
	public class APIService
	{
        static private readonly string ClientId = Environment.GetEnvironmentVariable("GAME_CLIENT_ID");
        static private readonly string ClientSecret = Environment.GetEnvironmentVariable("GAME_CLIENT_SECRET");
        static public void AddHttpClients(IServiceCollection services)
		{
            // Configure HTTP clients for API endpoints
            services.AddHttpClient("AuthClient", httpClient =>
            {
                httpClient.BaseAddress = new Uri($"https://id.twitch.tv/oauth2/token?client_id={ClientId}&client_secret={ClientSecret}&grant_type=client_credentials");
            });
            services.AddHttpClient("ApiClient", httpClient =>
            {
                httpClient.BaseAddress = new Uri("https://api.igdb.com/v4/");
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Client-ID", ClientId);
            });
        }

        private readonly IHttpClientFactory _httpClientFactory;
        private SemaphoreSlim tokenSemaphore;
        private string token = null;
        private TimeSpan? tokenExpiresAt = null;

        public APIService(IHttpClientFactory httpClientFactory)
        {
            _httpClientFactory = httpClientFactory;
            tokenSemaphore = new SemaphoreSlim(1, 1);
        }

        private async Task UpdateAuthToken()
        {
            await tokenSemaphore.WaitAsync();
            try
            {
                if (token != null && tokenExpiresAt.HasValue && tokenExpiresAt.Value > new TimeSpan(DateTime.Now.Ticks))
                {
                    return;
                }

                var authClient = _httpClientFactory.CreateClient("AuthClient");
                HttpResponseMessage authResult = await authClient.PostAsync("", null);
                authResult.EnsureSuccessStatusCode();

                string resStr = await authResult.Content.ReadAsStringAsync();
                AuthResponse res = JsonConvert.DeserializeObject<AuthResponse>(resStr);

                token = res.access_token;
                tokenExpiresAt = new TimeSpan(DateTime.Now.Ticks) + TimeSpan.FromSeconds(res.expires_in);
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nError while updating API auth token");
                throw e;
            }
            finally
            {
                tokenSemaphore.Release();
            }
        }

        public async Task<string> FetchData(string endpoint, string body)
        {
            try
            {
                await UpdateAuthToken();
                var client = _httpClientFactory.CreateClient("ApiClient");

                var request = new HttpRequestMessage
                {
                    Method = HttpMethod.Post,
                    RequestUri = new Uri(client.BaseAddress + endpoint),
                    Headers = {
                        { HttpRequestHeader.Authorization.ToString(), $"Bearer {token}" }
                    },
                    Content = new StringContent(body, Encoding.UTF8, "text/plain")
                };

                HttpResponseMessage response = await client.SendAsync(request);
                response.EnsureSuccessStatusCode();

                return await response.Content.ReadAsStringAsync();
            }
            catch (HttpRequestException e)
            {
                Console.WriteLine("\nError while fetching API data!");
                throw e;
            }
        }
    }
}

