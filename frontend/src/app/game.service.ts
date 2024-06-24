import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class GameService {

  private headers: HttpHeaders;
  private baseUrl: string = '/gateway/game';

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'})
  }

  searchGames(query: string) {
    return this.http.get<any[]>(`${this.baseUrl}/search/${query}`, {headers: this.headers});
  }
  getGameBySlug(slug: string) {
    return this.http.get<any[]>(`${this.baseUrl}/name/${slug}`, {headers: this.headers});
  }
  getTrendingGames() {
    return this.http.get<any[]>(`${this.baseUrl}/trending`, {headers: this.headers});
  }
}
