import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe, DatePipe } from '@angular/common';
import { RouterLink, ActivatedRoute, RouterModule } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';
import { ProductService } from '../../services/product.service';
import { ReviewService } from '../../services/review.service';
import { Product } from '../../interfaces/product';
import { Review } from '../../interfaces/review';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, DatePipe, RouterLink, RouterModule],
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

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private reviewService: ReviewService
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
      next: (res: any) => {
        this.product = res;
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'A termék nem található.';
        this.isLoading = false;
      }
    });
  }

  private loadReviews(productId: number): void {
    this.reviewService.getReviewByProductId(productId).subscribe({
      next: (res: any) => {
        this.reviews = res ?? [];
        if (this.reviews.length > 0) {
          const sum = this.reviews.reduce((s, r) => s + r.rating, 0);
          this.avgRating = Math.round(sum / this.reviews.length);
        }
      },
      error: () => { this.reviews = []; }
    });
  }

  getStarTypes(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating ? 'filled' : 'empty');
  }

  selectSize(size: string): void { this.selectedSize = size; }
  increaseQty(): void { if (this.quantity < 10) this.quantity++; }
  decreaseQty(): void { if (this.quantity > 1) this.quantity--; }
  toggleFavorite(): void { this.isFavorite = !this.isFavorite; }

  addToCart(): void {
    console.log('Kosárba:', this.product?.name, '| Méret:', this.selectedSize, '| Db:', this.quantity);
  }
}