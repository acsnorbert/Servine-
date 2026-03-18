import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class OrderItemsService {

  private readonly API = 'http://localhost:3000/api/order_items';
      
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
      
        // ── GET /api/order_items ────────────────────
        getOrderItems() 
        {
          return this.http.get(`${this.API}`, this.tokenHeader());
        }
        // ── GET /api/order_items/id ────────────────────
        getOrderItemById(id:number){
          return this.http.get(`${this.API}/${id}`,  this.tokenHeader())
        }
        // ── POST /api/order_items ────────────────────
        insertOrderItem(data:object){
          return this.http.post(`${this.API}`,data, this.tokenHeader())
        }
        // ── PATCH /api/order_items/id ────────────────────
        updateOrderItem(data:object, id:number){
          return this.http.patch(`${this.API}/${id}`,data, this.tokenHeader())
        }
        // ── DELETE /api/order_items/id ────────────────────
        deleteOrderItemById(id:number){
          return this.http.delete(`${this.API}/${id}`,  this.tokenHeader())
        }
}
