import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private headers: HttpHeaders;
  private baseUrl: string = '/gateway/review';

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'})
  }

  getReviewsByGame(slug: string) {
    return this.http.get<any[]>(`${this.baseUrl}/game/${slug}`, {headers: this.headers})
  }
  addReview(data: any, slug: string) {
    if (data.reviewText) data.reviewText = data.reviewText.replace(/(\r\n|\r|\n){2,}/g, '$1\n');
    return this.http.post<any>(this.baseUrl, Object.assign(data, {gameSlug: slug}), {headers: this.headers, withCredentials: true})
  }
  deleteReview(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, {headers: this.headers, withCredentials: true})
  }
  editReview(id: number, slug: string, data: any) {
    if (data.reviewText) data.reviewText = data.reviewText.replace(/(\r\n|\r|\n){2,}/g, '$1\n');
    return this.http.put<any>(`${this.baseUrl}/${id}`, Object.assign(data, {id: id, gameSlug: slug}), {headers: this.headers, withCredentials: true})
  }
  reportReview(id: number, reason: string, reviewText: string) {
    return this.http.post<any>(`${this.baseUrl}/report/${id}`, {reason: reason, reviewText: reviewText}, {headers: this.headers})
  }

  getReports() {
    return this.http.get<any[]>(`${this.baseUrl}/report`, {headers: this.headers, withCredentials: true})
  }
  resolveReview(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/report/${id}`, {headers: this.headers, withCredentials: true});
  }
}
