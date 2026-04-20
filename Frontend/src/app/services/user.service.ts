import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { Order } from '../interfaces/order';
import { UpdateProfilePayload } from '../interfaces/UpdateProfilePayload';
import { User } from '../interfaces/user';


export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
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
  getProfile(): Observable<User> {
    return this.http.get<User>(`${this.API}/profile`, this.tokenHeader());
  }

  // ── PATCH /api/users/profile ──────────────────
  updateProfile(payload: UpdateProfilePayload): Observable<{ message: string; user: User }> {
    return this.http.patch<{ message: string; user: User }>(
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


getOrderById(id: string): Observable<Order> {
  return this.http.get<Order>(`${environment.serverUrl}/api/orders/${id}`, this.tokenHeader());
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