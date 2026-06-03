import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from './api';

export interface User {
  id?: number;
  username: string;
  password?: string;
  role: 'MANAGER' | 'STORE_KEEPER' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(private http: HttpClient) {}

  login(username: string, password: string): Observable<User> {
    return this.http.post<User>(`${API_ENDPOINTS.auth}/login`, {
      username,
      password
    });
  }

  logout() {
    localStorage.removeItem('user');
  }

  getUser(): User | null {
    const data = localStorage.getItem('user');
    return data ? JSON.parse(data) : null;
  }

  isLoggedIn(): boolean {
    return this.getUser() !== null;
  }
  registerStaff(user: any): Observable<any> {
  return this.http.post(`${API_ENDPOINTS.auth}/register`, user);
}
}