import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';


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
  private readonly API = `${environment.serverUrl}/api/users`;
  private tokenName = environment.tokenName;

  
  constructor(private http: HttpClient) {}
  getToken(): String | null {
    return sessionStorage.getItem(this.tokenName);
  }

  tokenHeader(): { headers: HttpHeaders } {
  let token = this.getToken();
  const headers = new HttpHeaders({
    'Authorization': `Bearer ${token}`
      });
      return { headers }
    }

  // ── GET /api/users/profile ────────────────────
  getProfile(){
    return this.http.get<UserProfile>(`${this.API}/profile`, this.tokenHeader());
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
    return this.http.get<Order[]>(`${this.API}/orders`,this.tokenHeader());
  }
}