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
  createdAt: string;
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

  getToken(): string | null {
    return sessionStorage.getItem(this.tokenName)
      ?? localStorage.getItem(this.tokenName);
  }

  tokenHeader(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });
    return { headers };
  }

  // ── GET /api/users/profile ────────────────────
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.API}/profile`, this.tokenHeader());
  }

  // ── PATCH /api/users/profile ──────────────────
  updateProfile(payload: UpdateProfilePayload): Observable<{ message: string; user: UserProfile }> {
    return this.http.patch<{ message: string; user: UserProfile }>(
      `${this.API}/profile`,
      payload,
      this.tokenHeader()
    );
  }

  // ── PATCH /api/users/change-password ──────────
  changePassword(payload: ChangePasswordPayload): Observable<{ message: string }> {
  return this.http.patch<{ message: string }>(
    `${this.API}/change-password`,
    {
      oldPassword: payload.currentPassword,
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword
    },
    this.tokenHeader()
  );
}

// ── DELETE /api/users/profile ─────────────────
deleteAccount(): Observable<{ message: string }> {
  return this.http.delete<{ message: string }>(
    `${this.API}/profile`,
    this.tokenHeader()
  );
}

  // ── GET /api/users/orders ─────────────────────
  getMyOrders(): Observable<Order[]> {
  return this.http.get<Order[]>(`${environment.serverUrl}/api/orders/my`, this.tokenHeader());
}

  // ------ ADMIN -----------

  // ── GET /api/users ─────────────────────
  GetUsers(){
    return this.http.get(`${this.API}`,this.tokenHeader())
  }
  // ── GET /api/users ─────────────────────
  DeleteUser(id:string){
    return this.http.delete(`${this.API}/${id}`,this.tokenHeader())
  }
  // ── GET /api/users ─────────────────────
  ChangeUserRole(id:string, data:object){
    return this.http.patch(`${this.API}/${id}/role`,data,this.tokenHeader())
  }

}