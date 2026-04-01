import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  role: 'user' | 'admin';
  created_at: string;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  order_date: string;
  status: string;
  items: OrderItem[];
  total: number;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly API = 'http://localhost:3000/api/users';

  constructor(private http: HttpClient) {}

  // ── GET /api/users/profile ────────────────────
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/profile`);
  }

  // ── PATCH /api/users/profile ────────────────────
  updateProfile(payload: UpdateProfilePayload): Observable<{ message: string; user: UserProfile }> {
    return this.http.patch<{ message: string; user: UserProfile }>(`${this.API}/profile`, payload);
  }

  // ── PATCH /api/users/change-password ───────────
  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.API}/change-password`, payload);
  }

  // ── GET /api/users/orders ─────────────────────
  getMyOrders(): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.API}/orders`);
  }
}