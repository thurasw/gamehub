import { HttpHeaders, HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PromoService {

  private headers: HttpHeaders;
  private baseUrl: string = '/gateway/promo';

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'})
  }

  getPromos() {
    return this.http.get<any[]>(this.baseUrl, {headers: this.headers});
  }

  createPromo(data, images) {
    const formData: FormData = new FormData();

    for (let key in data) {
      formData.append(key, data[key])
    }
    for (let key in images) {
      formData.append(key, images[key])
    }
    return this.http.post(this.baseUrl, formData, {withCredentials: true})
  }

  deletePromo(id: number) {
    return this.http.delete<any>(`${this.baseUrl}/${id}`, {headers: this.headers, withCredentials: true})
  }
}
