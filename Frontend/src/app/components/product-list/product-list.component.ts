import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { ApiService } from '../../services/api.service';
import {  Category } from '../../interfaces/category'
import {  Product } from '../../interfaces/product'

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
        animate('400ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductListComponent implements OnInit, OnDestroy {

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  categories: Category[] = [];
  isLoading = true;
  errorMessage = '';

  selectedCategory: number | null = null;
  searchQuery = '';
  sortBy = 'default';

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
    ).subscribe(query => {
      if (query.trim().length >= 2) {
        this.api.searchProducts(query).subscribe({
          next: (res: Product[]) => { this.filteredProducts = res; },
          error: () => { this.filteredProducts = []; }
        });
      } else if (query.trim().length === 0) {
        this.applyLocalFilters();
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProducts(category_id?: number): void {
    this.isLoading = true;
    this.api.getProducts(category_id ? { category_id } : undefined).subscribe({
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
    this.api.getProducts().subscribe({
      // Kategóriákat a CategoryService-ből kell majd lekérni
      // egyelőre üres marad, a setCategory() használja a category_id-t
    });
  }

  private applyLocalFilters(): void {
    let list = [...this.allProducts];

    if (this.selectedCategory !== null) {
      list = list.filter(p => p.category_id === this.selectedCategory);
    }

    switch (this.sortBy) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
    }

    this.filteredProducts = list;
  }

  setCategory(id: number | null): void {
    this.selectedCategory = id;
    this.searchQuery = '';
    this.loadProducts(id ?? undefined);
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  onSortChange(): void {
    this.applyLocalFilters();
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = null;
    this.sortBy = 'default';
    this.errorMessage = '';
    this.loadProducts();
  }

  getCategoryIcon(categoryId: number): string {
    // Majd a valódi kategória nevek alapján igazítható
    return '✦';
  }

  getStarTypes(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating ? 'filled' : 'empty');
  }
}