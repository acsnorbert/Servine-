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

// Méretkészletek kategória szerint
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES     = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

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

  // Dinamikus méretkészlet
  sizes: string[] = [];
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProduct(id);
    }
  }

  private loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (res: any) => {
        this.product = res;
        this.reviews  = res.reviews ?? [];
        this.avgRating = res.avgRating ? Math.round(parseFloat(res.avgRating)) : 0;
        this.sizes = this.getSizesForProduct(res);
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'A termék nem található.';
        this.isLoading = false;
      }
    });
  }

  private getSizesForProduct(product: any): string[] {
  if (!product?.category) {
    console.log('Nincs category objektum');
    return [];
  }

  const category = product.category;
  const parentId = String(category.parent_id || '').trim();
  const catId    = String(category.id || '').trim();
  const catName  = (category.name || '').toLowerCase().trim();

  console.log('Kategória ellenőrzés - parentId:', parentId, 'catId:', catId, 'name:', catName);

  // RUHA
  if (
    parentId === '1' || 
    catId === '1' ||
    catName.includes('ruha') || 
    catName.includes('ruházat') || 
    catName.includes('clothing') ||
    catName.includes('felső') || 
    catName.includes('nadrág') ||
    catName.includes('póló')
  ) {
    console.log('→ Ruha méretkészlet aktiválva');
    return CLOTHING_SIZES;
  }

  // CIPŐ
  if (
    parentId === '2' || 
    catId === '2' ||
    catName.includes('cipő') || 
    catName.includes('shoe') || 
    catName.includes('footwear')
  ) {
    console.log('→ Cipő méretkészlet aktiválva');
    return SHOE_SIZES;
  }

  // PARFÜM
  console.log('→ Nincs méretválasztó');
  return [];
}

  // Van-e méretválasztó
  hasSizes(): boolean {
    return this.sizes.length > 0;
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

    this.reviewService.insertReviewForProduct((this.product as any).id, {
      rating:  this.newRating,
      comment: this.newComment.trim() || null
    }).subscribe({
      next: (res: any) => {
        this.reviewSubmitting = false;
        this.reviewSuccess    = true;
        this.newRating        = 0;
        this.newComment       = '';
        if (res.review) {
          this.reviews = [res.review, ...this.reviews];
          const sum = this.reviews.reduce((s, r) => s + r.rating, 0);
          this.avgRating = Math.round(sum / this.reviews.length);
        }
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

  getUserInitial(review: any): string {
    const name = review.user?.name;
    return name ? name[0].toUpperCase() : '#';
  }

  selectSize(size: string): void { this.selectedSize = size; }
  increaseQty(): void { if (this.quantity < 10) this.quantity++; }
  decreaseQty(): void { if (this.quantity > 1) this.quantity--; }
  toggleFavorite(): void { this.isFavorite = !this.isFavorite; }

  addToCart(): void {
    if (!this.product) return;
    if (this.hasSizes() && !this.selectedSize) {
      alert('Kérlek válassz méretet!');
      return;
    }
    this.cartService.addToCart(this.product, this.selectedSize ?? 'N/A', this.quantity);
  }
}