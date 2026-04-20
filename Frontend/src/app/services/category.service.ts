import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

   private readonly API = `${environment.serverUrl}/api/categories`;
  
    constructor(private http: HttpClient) {}

    getToken(): string | null {
      return localStorage.getItem(environment.tokenName);
    } 

    tokenHeader():{ headers: HttpHeaders }{
    
      let token = this.getToken();
      
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });

      return { headers }
    }
  
    // ── GET /api/categories ────────────────────
    getCategories() 
    {
      return this.http.get(`${this.API}`, this.tokenHeader());
    }
    // ── GET /api/categories/id ────────────────────
    getCategoriesById(id:string){
      return this.http.get(`${this.API}/${id}`,  this.tokenHeader())
    }
    // ── POST /api/categories ────────────────────
    insertCategories(data:object){
      return this.http.post(`${this.API}`,data, this.tokenHeader())
    }
    // ── PATCH /api/categories/id ────────────────────
    updateCategories(data:object, id:string){
      return this.http.patch(`${this.API}/${id}`,data, this.tokenHeader())
    }
    // ── DELETE /api/categories/id ────────────────────
    deleteCategoriesById(id:string){
      return this.http.delete(`${this.API}/${id}`,  this.tokenHeader())
    }
    

  
    
}
