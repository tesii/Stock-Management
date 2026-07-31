import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from './api';

export interface Item {
  id?: number;
  name: string;
  quantity: number;
  unit: string;
  unitPrice: number;
    currentStock?: number;
  availableQuantity?: number;
    stock?: number;


  // ✅ NEW FIELD
  minStockLevel: number;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {

  constructor(private http: HttpClient) {}

  // GET ALL
  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(API_ENDPOINTS.items);
  }

  // GET BY ID
  getItemById(id: number): Observable<Item> {
    return this.http.get<Item>(`${API_ENDPOINTS.items}/${id}`);
  }

  // CREATE
  createItem(item: Item): Observable<Item> {
    return this.http.post<Item>(API_ENDPOINTS.items, item);
  }

  // UPDATE
  updateItem(id: number, item: Item): Observable<Item> {
    return this.http.put<Item>(`${API_ENDPOINTS.items}/${id}`, item);
  }

  // DELETE
  deleteItem(id: number): Observable<any> {
    return this.http.delete(`${API_ENDPOINTS.items}/${id}`);
  }
}