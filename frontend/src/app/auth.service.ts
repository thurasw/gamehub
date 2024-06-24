import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private headers: HttpHeaders;
  private baseUrl: string = '/gateway/account';

  constructor(private http: HttpClient) {
    this.headers = new HttpHeaders({'Content-Type': 'application/json; charset=utf-8'})
  }

  public signup(data: any, persist: boolean) {
    return this.http.post<any>(`${this.baseUrl}/register?persist=${persist}`, data, {headers: this.headers, withCredentials: true});
  }

  public login(data: any, persist: boolean) {
    return this.http.post<any>(`${this.baseUrl}/login?persist=${persist}`, data, {headers: this.headers, withCredentials: true});
  }

  public auth() {
    return this.http.get<any>(`${this.baseUrl}/auth`, {headers: this.headers, withCredentials: true});
  }

  public logout() {
    return this.http.get<any>(`${this.baseUrl}/logout`, {headers: this.headers, withCredentials: true});
  }

  public verify(username: string, pin: number, persist: boolean) {
    return this.http.get<any>(`${this.baseUrl}/verify?username=${username}&pin=${pin}&persist=${persist}`, {headers: this.headers, withCredentials: true})
  }
  public sendEmail(username: string) {
    return this.http.get<any>(`${this.baseUrl}/email?username=${username}`, {headers: this.headers});
  }

  public sendPwResetEmail(email: string) {
    return this.http.get<any>(`${this.baseUrl}/reset-pw/email?email=${email}`, {headers: this.headers});
  }
  public resetPw(password: string, username: string, pin: number) {
    return this.http.post<any>(`${this.baseUrl}/reset-pw/reset`, {password: password, username: username, pin: pin}, {headers: this.headers, withCredentials: true})
  }
}
