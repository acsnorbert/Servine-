import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  private readonly API = 'http://localhost:3000/api/reviews';

  constructor(private http: HttpClient) {}

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  tokenHeader(): { headers: HttpHeaders } {
    const token = this.getToken();
    const headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    return { headers };
  }

  // GET /api/reviews/product/:productId
  // Visszaad: { reviews, avgRating, count }
  getReviewByProductId(id: string) {
    return this.http.get(`${this.API}/product/${id}`, this.tokenHeader());
  }

  // POST /api/reviews/product/:productId
  insertReviewForProduct(productId: string, data: { rating: number; comment: string | null }) {
    return this.http.post(`${this.API}/product/${productId}`, data, this.tokenHeader());
  }

  // PATCH /api/reviews/:id
  updateReview(data: object, id: string) {
    return this.http.patch(`${this.API}/${id}`, data, this.tokenHeader());
  }

  // DELETE /api/reviews/:id
  deleteReviewById(id: string) {
    return this.http.delete(`${this.API}/${id}`, this.tokenHeader());
  }
}