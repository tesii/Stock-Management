import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_ENDPOINTS } from './api';

export interface Audit {
  id: number;
  username: string;
  role: string;
  action: string;
  entityName: string;
  entityId: number;
  description: string;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuditService {

  constructor(private http: HttpClient) {}

  getAudits(): Observable<Audit[]> {
    return this.http.get<Audit[]>(API_ENDPOINTS.audits);
  }
}