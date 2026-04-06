import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

   private readonly API = 'http://localhost:3000/api/orders';
    private tokenName ="Servine";
      constructor(private http: HttpClient) {}
  
    getToken(): String | null {
     return sessionStorage.getItem(this.tokenName);
    }

    tokenHeader():{ headers: HttpHeaders }{
      
      let token = this.getToken();
    
      const headers = new HttpHeaders({
        'Authorization': `Bearer ${token}`
      });
      return { headers }
    }
      
      // ── GET /api/orders ────────────────────
      getOrders() 
      {
        return this.http.get(`${this.API}`, this.tokenHeader());
      }
      // ── GET /api/orders/id ────────────────────
      getOrdersById(id:string){
        return this.http.get(`${this.API}/${id}`,  this.tokenHeader())
      }
      // ── POST /api/orders ────────────────────
      insertOrder(data:object){
        return this.http.post(`${this.API}`,data, this.tokenHeader())
      }
      // ── PATCH /api/orders/id ────────────────────
      updateOrder(data:object, id:string){
        return this.http.patch(`${this.API}/${id}`,data, this.tokenHeader())
      }
      // ── DELETE /api/orders/id ────────────────────
      deleteOrdersById(id:string){
        return this.http.delete(`${this.API}/${id}`,  this.tokenHeader())
      }
}
