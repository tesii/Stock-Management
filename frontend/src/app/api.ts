import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export const API_BASE_URL = 'http://localhost:8081/api';
 export const API_BASE_URLs =  'http://localhost:8081/api'

 

export const API_ENDPOINTS = {
  items: `${API_BASE_URL}/items`,
  auth: `${API_BASE_URL}/auth`,
  stock: `${API_BASE_URLs}/stock`,
    audits: `${API_BASE_URLs}/audits`,

  site: `${API_BASE_URLs}/site`
};