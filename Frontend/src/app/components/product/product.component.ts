import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProductService } from '../../services/product.service';
import { ReviewService } from '../../services/review.service';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../interfaces/product';
import { Review } from '../../interfaces/review';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, DatePipe, RouterLink, FormsModule],
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(32px)' }),
        animate('500ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('400ms ease', style({ opacity: 1 }))
      ])
    ])
  ]
})
export class ProductComponent implements OnInit {

  product: Product | null = null;
  reviews: Review[] = [];
  avgRating = 0;
  isLoading = true;
  errorMessage = '';

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedSize: string | null = null;
  quantity = 1;
  activeTab: 'description' | 'reviews' = 'description';
  isFavorite = false;

  newRating = 0;
  newComment = '';
  reviewSubmitting = false;
  reviewSuccess = false;
  reviewError = '';

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private reviewService: ReviewService,
    private cartService: CartService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (id) {
      this.loadProduct(id);
      this.loadReviews(id);
    }
  }

  private loadProduct(id: number): void {
    this.productService.getProductById(id).subscribe({
      next: (res: any) => { this.product = res; this.isLoading = false; },
      error: ()        => { this.errorMessage = 'A termék nem található.'; this.isLoading = false; }
    });
  }

  private loadReviews(productId: number): void {
    // GET /api/reviews/product/:productId
    // Visszaad: { reviews, avgRating, count }
    this.reviewService.getReviewByProductId(productId).subscribe({
      next: (res: any) => {
        this.reviews = res.reviews ?? [];
        this.avgRating = res.avgRating ? Math.round(parseFloat(res.avgRating)) : 0;
      },
      error: () => { this.reviews = []; }
    });
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedIn();
  }

  setNewRating(star: number): void {
    this.newRating = star;
  }

  submitReview(): void {
    if (!this.product || this.newRating === 0) return;

    this.reviewSubmitting = true;
    this.reviewError = '';

    // POST /api/reviews/product/:productId
    // A ReviewService-ben nincs ilyen metódus — közvetlenül hívjuk
    this.reviewService.insertReviewForProduct(this.product.id!, {
      rating:  this.newRating,
      comment: this.newComment.trim() || null
    }).subscribe({
      next: () => {
        this.reviewSubmitting = false;
        this.reviewSuccess    = true;
        this.newRating        = 0;
        this.newComment       = '';
        this.loadReviews(this.product!.id!);
        setTimeout(() => { this.reviewSuccess = false; }, 3000);
      },
      error: (err) => {
        this.reviewSubmitting = false;
        this.reviewError = err?.error?.message ?? 'Nem sikerült elküldeni az értékelést.';
      }
    });
  }

  getStarTypes(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating ? 'filled' : 'empty');
  }

  getUserName(review: any): string {
    return review.user?.name ?? `Felhasználó #${review.user_id}`;
  }

  selectSize(size: string): void { this.selectedSize = size; }
  increaseQty(): void { if (this.quantity < 10) this.quantity++; }
  decreaseQty(): void { if (this.quantity > 1) this.quantity--; }
  toggleFavorite(): void { this.isFavorite = !this.isFavorite; }

  addToCart(): void {
    if (!this.product) return;
    if (!this.selectedSize) { alert('Kérlek válassz méretet!'); return; }
    this.cartService.addToCart(this.product, this.selectedSize, this.quantity);
  }
}