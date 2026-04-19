// services/order.service.ts
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class OrderService {
  private readonly API = 'http://localhost:3000/api/orders';

  constructor(private http: HttpClient) {}

  private tokenHeader(): { headers: HttpHeaders } {
    const token = localStorage.getItem('Servine');
    return { headers: new HttpHeaders({ Authorization: `Bearer ${token}` }) };
  }

  createOrder(items: { product_id: string; quantity: number; price: number }[]) {
    return this.http.post(this.API, { items }, this.tokenHeader());
  }

  getMyOrders() {
    return this.http.get(`${this.API}/my`, this.tokenHeader());
  }

  getOrderById(id: string) {
    return this.http.get(`${this.API}/${id}`, this.tokenHeader());
  }
  getOrders(){
    return this.http.get(`${this.API}`, this.tokenHeader());
  }
  UpdateOrderStatus(id:string, data:object){
    return this.http.patch(`${this.API}/${id}/status`,data, this.tokenHeader());
  }
  UpdateTotalPrice(id:string){
    return this.http.patch(`${this.API}/${id}/total`,{}, this.tokenHeader());
  }
  DeleteOrder(id: string){
    return this.http.delete(`${this.API}/${id}`, this.tokenHeader());
  }
}