import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

   private readonly API = 'http://localhost:3000/api/products';
    
      constructor(private http: HttpClient) {}
  
      getToken(): string | null {
        return localStorage.getItem('token');
      } 
  
      tokenHeader():{ headers: HttpHeaders }{
      
        let token = this.getToken();
        
        const headers = new HttpHeaders({
          'Authorization': `Bearer ${token}`
        });
  
        return { headers }
      }
    
      // ── GET /api/products ────────────────────
      getProducts() 
      {
        return this.http.get(`${this.API}`, this.tokenHeader());
      }
      // ── GET /api/products/id ────────────────────
      getProductById(id:number){
        return this.http.get(`${this.API}/${id}`,  this.tokenHeader())
      }
      // ── POST /api/products ────────────────────
      insertProduct(data:object){
        return this.http.post(`${this.API}`,data, this.tokenHeader())
      }
      // ── PATCH /api/products/id ────────────────────
      updateProduct(data:object, id:number){
        return this.http.patch(`${this.API}/${id}`,data, this.tokenHeader())
      }
      // ── DELETE /api/products/id ────────────────────
      deleteProductById(id:number){
        return this.http.delete(`${this.API}/${id}`,  this.tokenHeader())
      }
}
