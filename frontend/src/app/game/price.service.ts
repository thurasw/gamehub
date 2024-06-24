import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PriceService {

  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'})
  }

  getPriceFromGame(websites: Array<any>) {
    let website = websites.find(w => w.category === 16);

    return new Promise((resolve, reject) => {
      if (!website) resolve(null);
      
      this.http.get<any>(`https://store.playstation.com/store/api/chihiro/00_09_000/container/US/en/999/${website.uid}`).subscribe(data => {
        if (data.default_sku && data.default_sku.display_price) {
          resolve({price: data.default_sku.display_price, store: 'ps', website: `https://store.playstation.com/en-us/product/${website.uid}`});
        }
        else resolve(null);
      }, e => resolve(null))
    })
    
  }
}
