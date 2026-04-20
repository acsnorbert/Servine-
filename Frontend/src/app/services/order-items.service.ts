import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map } from 'rxjs';
import { environment } from '../enviroments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderItemsService {

  private readonly API =  `${environment.serverUrl}/api/order-items`;
      
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
      
        // ── GET /api/order_items ────────────────────
        getOrderItems() 
        {
          return this.http.get(`${this.API}`, this.tokenHeader());
        }
        // ── GET /api/order_items/id ────────────────────
        getOrderItemByOrderId(order_id:string){
          return this.http.get(`${this.API}/order/${order_id}`,  this.tokenHeader())
        }
         // ── GET /api/order_items/id ────────────────────
        getOrderItemQuantityById(id:string){
          return this.http.get(`${this.API}/${id}/quantity`,  this.tokenHeader())
        }
        // ── POST /api/order_items ────────────────────
        insertOrderItem(data:object){
          return this.http.post(`${this.API}`,data, this.tokenHeader())
        }
        // ── PATCH /api/order_items/id ────────────────────
        updateOrderItem(data:object, id:string){
          return this.http.patch(`${this.API}/${id}`,data, this.tokenHeader())
        }
        // ── DELETE /api/order_items/id ────────────────────
        deleteOrderItemById(id:string){
          return this.http.delete(`${this.API}/${id}`,  this.tokenHeader())
        }
}
