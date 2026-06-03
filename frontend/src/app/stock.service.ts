import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from './api';

export interface StockMovement {
  id?: number;
  itemId: number;
  type: 'IN' | 'OUT';
  quantity: number;
  site?: string;
  date?: string;
  note?: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

@Injectable({
  providedIn: 'root'
})
export class StockService {

  constructor(private http: HttpClient) {}

  // ================= CREATE MOVEMENT =================
  createMovement(data: StockMovement): Observable<StockMovement> {
    return this.http.post<StockMovement>(API_ENDPOINTS.stock, data);
  }

  // ================= GET ALL MOVEMENTS =================
  getMovements(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(API_ENDPOINTS.stock);
  }

  // ================= APPROVE =================
  approveMovement(id: number): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.stock}/approve/${id}`, {});
  }

  // ================= REJECT =================
  rejectMovement(id: number): Observable<any> {
    return this.http.put(`${API_ENDPOINTS.stock}/reject/${id}`, {});
  }

  // ================= GET PENDING ONLY =================
  getPendingOut(): Observable<StockMovement[]> {
    return this.http.get<StockMovement[]>(
      `${API_ENDPOINTS.stock}?status=PENDING`
    );
  }

buildStockSummary(items: any[], movements: StockMovement[]) {

  const itemMap = new Map<number, string>();

  // 👉 SOURCE OF TRUTH: DB stock
  const dbStock = new Map<number, number>();

  items.forEach(i => {
    itemMap.set(i.id, i.name);

    // THIS is your STOCK LEFT from database table
    dbStock.set(i.id, Number(i.quantity ?? 0));
  });

  // movement aggregation
  const movementMap = new Map<number, { in: number; out: number }>();

  movements.forEach(m => {
    if (!m?.itemId) return;

    const current = movementMap.get(m.itemId) ?? { in: 0, out: 0 };
    const qty = Number(m.quantity ?? 0);

    if (m.type === 'IN') current.in += qty;
    if (m.type === 'OUT') current.out += qty;

    movementMap.set(m.itemId, current);
  });

  return Array.from(dbStock.entries()).map(([id, stockLeft]) => {

    const m = movementMap.get(id) ?? { in: 0, out: 0 };

    return {
      itemId: id,
      itemName: itemMap.get(id) || `Item ${id}`,

      // ✅ THIS is real stock left from DB
      qtotal: stockLeft,

      // history (for reports only)
      qin: m.in,
      qout: m.out
    };
  });
}
}