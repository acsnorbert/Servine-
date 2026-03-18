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
    
        tokenHeader():{ headers: HttpHeaders }{
        
          let token = this.getToken();
          
          const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
          });
    
          return { headers }
        }
      
        // ── GET /api/reviews ────────────────────
        getReviews() 
        {
          return this.http.get(`${this.API}`, this.tokenHeader());
        }
        // ── GET /api/reviews/id ────────────────────
        getReviewById(id:number){
          return this.http.get(`${this.API}/${id}`,  this.tokenHeader())
        }
        // ── GET /api/reviews/product/id ────────────────────
        getReviewByProductId(id:number){
          return this.http.get(`${this.API}/product/${id}`,  this.tokenHeader())
        }
        // ── POST /api/reviews ────────────────────
        insertReview(data:object){
          return this.http.post(`${this.API}`,data, this.tokenHeader())
        }
        // ── PATCH /api/reviews/id ────────────────────
        updateReview(data:object, id:number){
          return this.http.patch(`${this.API}/${id}`,data, this.tokenHeader())
        }
         // ── PATCH /api/reviews/id ────────────────────
        updateProductReview(data:object, id:number){
          return this.http.patch(`${this.API}/product/${id}`,data, this.tokenHeader())
        }
        // ── DELETE /api/reviews/id ────────────────────
        deleteReviewById(id:number){
          return this.http.delete(`${this.API}/${id}`,  this.tokenHeader())
        }
}
