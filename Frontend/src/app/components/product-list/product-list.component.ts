import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';
import { trigger, transition, style, animate } from '@angular/animations';
import { ApiService } from '../../services/api.service';
import { Category } from '../../interfaces/category';
import { Product } from '../../interfaces/product'; // Fontos: a Product interfészben legyen benne a 'stock' attribútum!

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
  selectedCategory: number | null = null;
  searchQuery = '';
  sortBy = 'default';
  
  // ÚJ: Kiterjesztett szűrők
  minPrice: number | null = null;
  maxPrice: number | null = null;
  inStockOnly: boolean = false;

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
        this.allCategories = res; // Eltároljuk az összeset a szűréshez
        this.categories = res.filter(c => c.parent_id === null); // Gombokhoz fő kategóriák
      },
      error: (err) => {
        console.error('Nem sikerült betölteni a kategóriákat.', err);
      }
    });
  }

  // --- KÖZÖS SZŰRŐ LOGIKA ---
  applyLocalFilters(): void {
    let list = [...this.allProducts];

    // 1. Kategória szűrés
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

    // 3. Ár szűrés (HÜLYEBIZTOSÍTVA)
    let actualMin = this.minPrice !== null && this.minPrice >= 0 ? this.minPrice : null;
    let actualMax = this.maxPrice !== null && this.maxPrice > 0 ? this.maxPrice : null;

    // Ha a júzer véletlenül fordítva írta be (Min > Max), a háttérben megcseréljük
    if (actualMin !== null && actualMax !== null && actualMin > actualMax) {
      const temp = actualMin;
      actualMin = actualMax;
      actualMax = temp;
    }

    if (actualMin !== null) {
      list = list.filter(p => p.price >= actualMin!);
    }
    if (actualMax !== null) {
      list = list.filter(p => p.price <= actualMax!);
    }

    // 4. Csak raktáron lévők
    if (this.inStockOnly) {
      list = list.filter(p => p.stock > 0);
    }

    // 5. Rendezés
    switch (this.sortBy) {
      case 'price_asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price_desc': list.sort((a, b) => b.price - a.price); break;
    }

    this.filteredProducts = list;
  }
  setCategory(id: number | null): void {
    this.selectedCategory = id;
    this.applyLocalFilters();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchQuery);
  }

  // Ezt hívjuk meg, ha az ár vagy a checkbox változik
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