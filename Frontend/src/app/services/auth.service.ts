import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../enviroments/environment';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:3000/api/auth';

  currentUser = signal<AuthUser | null>(this.loadUser());
  private tokenName = environment.tokenName;

  constructor(private http: HttpClient, private router: Router) {}
  // Bejelentkezés ellenőrzése
  private isLoggedIn = new BehaviorSubject<boolean>(this.getToken());
  isLoggedIn$ = this.isLoggedIn.asObservable();

  // ── Bejelentkezés ─────────────────────────────
  login(token:string){
    sessionStorage.setItem(this.tokenName, token);
    this.isLoggedIn.next(true);
  }

  // ── Elfelejtett jelszó ────────────────────────
  forgotPassword(email: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/forgot-password`, { email });
  }

  // ── Jelszó visszaállítása ─────────────────────
  resetPassword(token: string, password: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.API}/reset-password`, { token, password });
  }

  // ── Kijelentkezés ─────────────────────────────
  logout(){
    sessionStorage.removeItem(this.tokenName);
    localStorage.removeItem(this.tokenName);
    this.isLoggedIn.next(false);
  }

  // ── Token lekérése (HttpInterceptor használja) ─
  getToken(){
    const sess = sessionStorage.getItem(this.tokenName);
    if (sess) return true;

    const locs = localStorage.getItem(this.tokenName);

    if (locs) {
      sessionStorage.setItem(this.tokenName, locs);
      return true;
    }

    return false;
  }
  loggedUser(){
    const token = sessionStorage.getItem(this.tokenName);
    if (token){
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      const decodedUTF8Payload = new TextDecoder('utf-8').decode(
        new Uint8Array(decodedPayload.split('').map(char => char.charCodeAt(0)))
      );
      return JSON.parse(decodedUTF8Payload);
    }
    return "no token";
  }
  storeUser(token: string){
    localStorage.setItem(this.tokenName, token);
  }
   isLoggedUser():boolean{
    return this.isLoggedIn.value;
  }

  
  isAdmin(): boolean {
    return this.currentUser()?.role === 'admin';
  }

  // ── Privát segédek ────────────────────────────
  private saveSession(res: AuthResponse): void {
    localStorage.setItem('token', res.token);
    localStorage.setItem('user', JSON.stringify(res.user));
    this.currentUser.set(res.user);
  }

  private loadUser(): AuthUser | null {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  }
}