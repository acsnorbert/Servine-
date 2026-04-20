import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../enviroments/environment';
import { CartService } from './cart.service';
import { User } from '../interfaces/user';


@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = `${environment.serverUrl}/api/auth`;

  currentUser = signal<User | null>(this.loadUser());

  private tokenName = environment.tokenName;

  private isLoggedIn = new BehaviorSubject<boolean>(!!this.hasToken());
  isLoggedIn$ = this.isLoggedIn.asObservable();

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private cartService: CartService) {}

  // ── Bejelentkezés ─────────────────────────────
  login(token: string, user?: User): void {
    sessionStorage.setItem(this.tokenName, token);
    this.isLoggedIn.next(true);

    if (user) {
      sessionStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('user', JSON.stringify(user));
      this.currentUser.set(user);
    }
  }

  // ── Kijelentkezés ─────────────────────────────
  logout(): void {
    sessionStorage.removeItem(this.tokenName);
    sessionStorage.removeItem('user');
    localStorage.removeItem(this.tokenName);
    localStorage.removeItem('user');
     localStorage.removeItem('servine_cart');
    this.currentUser.set(null);
    this.isLoggedIn.next(false);
    this.router.navigate(['/login']);
  }

  // ── Elfelejtett jelszó ────────────────────────
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/forgot-password`, { email });
  }

  // ── Jelszó visszaállítása ─────────────────────
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/reset-password`, { token, password });
  }

  // ── Token lekérése ────────────────────────────
  getTokenValue(): string | null {
    return sessionStorage.getItem(this.tokenName)
      ?? localStorage.getItem(this.tokenName);
  }

  // ── Be van-e jelentkezve ──────────────────────
  isLoggedUser(): boolean {
    return this.isLoggedIn.value;
  }

  // ── Admin-e ───────────────────────────────────
  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  // ── JWT payload dekódolás (ha szükséges) ──────
  loggedUser(): any {
    const token = sessionStorage.getItem(this.tokenName);
    if (!token) return null;
    try {
      const payload = token.split('.')[1];
      return JSON.parse(atob(payload));
    } catch {
      return null;
    }
  }

  // ── Privát segédek ────────────────────────────
  private hasToken(): boolean {
    return !!(sessionStorage.getItem(this.tokenName) ?? localStorage.getItem(this.tokenName));
  }

  private loadUser(): User | null {
    try {
      // Előbb sessionStorage, aztán localStorage
      const raw = sessionStorage.getItem('user') ?? localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }

  storeUser(token: string): void {
  localStorage.setItem(this.tokenName, token);
}

getToken(): string | null {
  return sessionStorage.getItem(this.tokenName)
    ?? localStorage.getItem(this.tokenName);
}

}

