import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:3000/api';

@Injectable({ providedIn: 'root' })
export class ApiService {

  constructor(private http: HttpClient) {}

  // AUTH
  login(email: string, password: string): Observable<any> {
    return this.http.post(`${BASE}/auth/login`, { email, password });
  }

  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${BASE}/auth/register`, { name, email, password });
  }

  forgotPassword(email: string): Observable<any> {
    return this.http.post(`${BASE}/auth/forgot-password`, { email });
  }

  resetPassword(token: string, password: string): Observable<any> {
    return this.http.post(`${BASE}/auth/reset-password`, { token, password });
  }

  // USER / PROFIL
  getProfile(): Observable<any> {
    return this.http.get(`${BASE}/users/profile`);
  }

  updateProfile(data: { name: string; email: string; phone?: string; address?: string }): Observable<any> {
    return this.http.put(`${BASE}/users/profile`, data);
  }

  changePassword(currentPassword: string, newPassword: string): Observable<any> {
    return this.http.put(`${BASE}/users/change-password`, { currentPassword, newPassword });
  }

  getMyOrders(): Observable<any> {
    return this.http.get(`${BASE}/users/orders`);
  }

  // KATEGÓRIÁK (ÚJ)
  getCategories(): Observable<any> {
    return this.http.get(`${BASE}/categories`);
  }

  // TERMÉKEK
  getProducts(filters?: { category_id?: number; min_price?: number; max_price?: number; sort?: string }): Observable<any> {
    let params = new HttpParams();
    if (filters?.category_id) params = params.set('category_id', filters.category_id);
    if (filters?.min_price)   params = params.set('min_price',   filters.min_price);
    if (filters?.max_price)   params = params.set('max_price',   filters.max_price);
    if (filters?.sort)        params = params.set('sort',        filters.sort);
    return this.http.get(`${BASE}/products`, { params });
  }

  getProductById(id: number): Observable<any> {
    return this.http.get(`${BASE}/products/${id}`);
  }

  searchProducts(q: string): Observable<any> {
    const params = new HttpParams().set('q', q);
    return this.http.get(`${BASE}/products/search`, { params });
  }

  // RENDELÉSEK
  getOrderById(id: number): Observable<any> {
    return this.http.get(`${BASE}/orders/${id}`);
  }

  getMyOrdersDetail(): Observable<any> {
    return this.http.get(`${BASE}/orders/my`);
  }

  createOrder(data: any): Observable<any> {
    return this.http.post(`${BASE}/orders`, data);
  }

  updateOrderStatus(id: number, status: string): Observable<any> {
    return this.http.put(`${BASE}/orders/${id}/status`, { status });
  }
}