import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { ApiService } from '../../services/api.service';
import { Category } from '../../interfaces/category';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, RouterLink, FormsModule],
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductListComponent implements OnInit, OnDestroy {
  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  allCategories: Category[] = [];
  isLoading = true;
  errorMessage = '';

  // Szűrő paraméterek
  selectedCategory: string | null = null;
  searchQuery = '';
  sortBy = 'default';
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly: boolean = false;

  // Pagination
  currentPage = 1;
  pageSize = 12;

  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadProducts();
    this.loadCategories();

    this.searchSubject.pipe(
      debounceTime(350),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(() => {
      this.applyLocalFilters();
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ── Pagination ────────────────────────────────
  get totalPages(): number {
    return Math.ceil(this.filteredProducts.length / this.pageSize);
  }

  get paginatedProducts(): Product[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProducts.slice(start, start + this.pageSize);
  }

  get pageNumbers(): number[] {
    const total = this.totalPages;
    const current = this.currentPage;

    if (total <= 7) {
      return Array.from({ length: total }, (_, i) => i + 1);
    }

    const pages: number[] = [1];

    if (current > 3) pages.push(-1);

    const start = Math.max(2, current - 1);
    const end   = Math.min(total - 1, current + 1);

    for (let i = start; i <= end; i++) pages.push(i);

    if (current < total - 2) pages.push(-2);

    pages.push(total);
    return pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.currentPage = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ── API ───────────────────────────────────────
  private loadProducts(): void {
    this.isLoading = true;
    this.api.getProducts().subscribe({
      next: (res: Product[]) => {
        this.allProducts = res;
        this.applyLocalFilters();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'Nem sikerült betölteni a termékeket.';
        this.isLoading = false;
      }
    });
  }

  private loadCategories(): void {
    this.api.getCategories().subscribe({
      next: (res: Category[]) => {
        this.allCategories = res;
        this.categories = res.filter(c => c.parent_id === null);
      },
      error: (err) => {
        console.error('Nem sikerült betölteni a kategóriákat.', err);
      }
    });
  }

  // ── Szűrő logika ──────────────────────────────
  applyLocalFilters(): void {
    let list = [...this.allProducts];

    // 1. Kategória
    if (this.selectedCategory !== null) {
      const validCategoryIds = this.allCategories
        .filter(c => c.parent_id === this.selectedCategory || c.id === this.selectedCategory)
        .map(c => c.id);
      list = list.filter(p => validCategoryIds.includes(p.category_id));
    }

    // 2. Szöveges keresés
    if (this.searchQuery && this.searchQuery.trim().length > 0) {
      const query = this.searchQuery.toLowerCase().trim();
      list = list.filter(p => p.name.toLowerCase().includes(query));
    }

    // 3. Ár szűrés
    let actualMin = this.minPrice !== null && this.minPrice >= 0 ? this.minPrice : null;
    let actualMax = this.maxPrice !== null && this.maxPrice > 0  ? this.maxPrice : null;

    if (actualMin !== null && actualMax !== null && actualMin > actualMax) {
      [actualMin, actualMax] = [actualMax, actualMin];
    }

    if (actualMin !== null) list = list.filter(p => p.price >= actualMin!);
    if (actualMax !== null) list = list.filter(p => p.price <= actualMax!);

    // 4. Csak raktáron
    if (this.inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // 5. Rendezés
    switch (this.sortBy) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
    }

    this.filteredProducts = list;
    this.currentPage = 1;
  }

  setCategory(id: string | null): void {
    this.selectedCategory = id;
    this.applyLocalFilters();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onAdvancedFilterChange(): void {
    this.applyLocalFilters();
  }

  resetFilters(): void {
    this.selectedCategory = null;
    this.searchQuery = '';
    this.sortBy = 'default';
    this.minPrice = null;
    this.maxPrice = null;
    this.inStockOnly = false;
    this.applyLocalFilters();
  }
}