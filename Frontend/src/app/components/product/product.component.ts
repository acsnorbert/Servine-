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
import { MessageService } from '../../services/message.service';

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const SHOE_SIZES     = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
const PERFUME_SIZES = ['100ml'];
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
  cartBtnState: 'idle' | 'success' = 'idle';

  sizes: string[] = [];
  selectedSize: string | null = null;
  quantity = 1;
  activeTab: 'description' | 'reviews' = 'description';

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
    private authService: AuthService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadProduct(id);
  }

  private loadProduct(id: string): void {
    this.productService.getProductById(id).subscribe({
      next: (res: any) => {
        this.product   = res;
        this.reviews   = res.reviews ?? [];
        this.avgRating = res.avgRating ? Math.round(parseFloat(res.avgRating)) : 0;
        this.sizes     = this.getSizesForProduct(res);
        this.isLoading = false;
        // debug: nezd meg mit kap vissza a kategoria
        //console.log('category:', res.category);
        //console.log('sizes:', this.sizes);
      },
      error: () => {
        this.errorMessage = 'A termek nem talalhato.';
        this.isLoading = false;
      }
    });
  }

  private getSizesForProduct(product: any): string[] {
  if (!product?.category) return [];

  const normalize = (s: string) =>
    s.toLowerCase().trim()
      .replace(/á/g, 'a').replace(/é/g, 'e').replace(/í/g, 'i')
      .replace(/ó/g, 'o').replace(/ö/g, 'o').replace(/ő/g, 'o')
      .replace(/ú/g, 'u').replace(/ü/g, 'u').replace(/ű/g, 'u');

  const catName = normalize(product.category.name || '');
  const parentName = normalize(product.category.parent?.name || '');

  const isClothing =
    catName.includes('ruha') ||
    catName.includes('ruhazat') ||
    catName.includes('clothing') ||
    catName.includes('felso') ||
    catName.includes('nadrag') ||
    catName.includes('polo') ||
    catName.includes('ing') ||
    catName.includes('kabat') ||
    parentName.includes('ruha') ||
    parentName.includes('ruhazat') ||
    parentName.includes('clothing');

  const isShoe =
    catName.includes('cipo') ||
    catName.includes('shoe') ||
    catName.includes('footwear') ||
    catName.includes('szandal') ||
    catName.includes('csizma') ||
    parentName.includes('cipo') ||
    parentName.includes('shoe');

  const isPerfume =
    catName.includes('parfum') ||
    catName.includes('parfume') ||
    catName.includes('perfume') ||
    parentName.includes('parfum') ||
    parentName.includes('perfume');

  if (isClothing) return CLOTHING_SIZES;
  if (isShoe) return SHOE_SIZES;
  if (isPerfume) return PERFUME_SIZES;

  return [];
}

  // Kosarban levo mennyiseg ugyanehhez a termekhez+merethez
  get cartQuantity(): number {
    if (!this.product) return 0;
    return this.cartService.getItems()
      .filter(i =>
        i.product.id === (this.product as any).id &&
        i.size === (this.selectedSize ?? 'N/A')
      )
      .reduce((s, i) => s + i.quantity, 0);
  }

  // Meg rendelheto max mennyiseg
  get availableStock(): number {
    if (!this.product) return 0;
    return Math.max(0, this.product.stock - this.cartQuantity);
  }

  hasSizes(): boolean {
    return this.sizes.length > 0;
  }

  isLoggedIn(): boolean {
    return this.authService.isLoggedUser();
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
        this.reviewError = err?.error?.message ?? 'Nem sikerult elkuldenai az ertekeleszt.';
      }
    });
  }

  getStarTypes(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating ? 'filled' : 'empty');
  }

  getUserName(review: any): string {
    return review.user?.name ?? `Felhasznalo #${review.user_id}`;
  }

  getUserInitial(review: any): string {
    const name = review.user?.name;
    return name ? name[0].toUpperCase() : '#';
  }

  selectSize(size: string): void {
    this.selectedSize = size;
    if (this.quantity > this.availableStock) {
      this.quantity = Math.max(1, this.availableStock);
    }
  }

  increaseQty(): void {
    if (this.quantity < this.availableStock) this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }


  addToCart(): void {
  if (!this.product) return;
  if (this.hasSizes() && !this.selectedSize) {
    this.messageService.show('warn', 'Méret szükséges', 'Kérlek válassz méretet!');
    return;
  }
  if (this.availableStock <= 0) return;

  this.cartService.addToCart(this.product, this.selectedSize ?? 'N/A', this.quantity);

  this.cartBtnState = 'success';       
  this.messageService.show(
    'success',
    'Kosárba rakva!',
    `${this.product.name}${this.selectedSize ? ' – ' + this.selectedSize : ''} sikeresen a kosárba került.`
  );

  setTimeout(() => { this.cartBtnState = 'idle'; }, 500);
  this.quantity = 1;
}
}