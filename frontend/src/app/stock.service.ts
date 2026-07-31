import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from './api';


export interface Site {
  id: number;
  siteName: string;
}


export interface StockMovement {
  id?: number;
  itemId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  site: Site | null;
  date?: string;
  note?: string;
  status?:
    'PENDING' |
    'APPROVED' |
    'REJECTED';
}


@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) {}

  // ================= CURRENT USER HELPER =================
  private getCurrentUser(): { username: string; role: string } {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        username: user.username || 'unknown',
        role: user.role || 'UNKNOWN'
      };
    } catch {
      return { username: 'unknown', role: 'UNKNOWN' };
    }
  }

  // ================= CREATE =================
  createMovement(data: StockMovement): Observable<StockMovement> {
    const { username, role } = this.getCurrentUser();

    return this.http.post<StockMovement>(
      `${API_ENDPOINTS.stock}?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`,
      data
    );
  }

  // ================= GET ALL =================
  getMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(API_ENDPOINTS.stock);
  }

  // ================= APPROVE =================
  approveMovement(id: number): Observable<any> {
    const { username, role } = this.getCurrentUser();

    return this.http.put(
      `${API_ENDPOINTS.stock}/approve/${id}?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`,
      {}
    );
  }

  // ================= REJECT =================
  rejectMovement(id: number): Observable<any> {
    const { username, role } = this.getCurrentUser();

    return this.http.put(
      `${API_ENDPOINTS.stock}/reject/${id}?username=${encodeURIComponent(username)}&role=${encodeURIComponent(role)}`,
      {}
    );
  }

  // ================= PENDING =================
  getPendingOut(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(
      `${API_ENDPOINTS.stock}?status=PENDING`
    );
  }

}