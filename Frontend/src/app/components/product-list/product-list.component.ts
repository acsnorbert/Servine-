import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  image?: string;
  isNew?: boolean;
}

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
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
export class ProductListComponent {

  // ── Kategóriák
  categories = [
    { key: 'all',       label: 'Összes'},
    { key: 'clothing',  label: 'Ruházat'},
    { key: 'shoes',     label: 'Cipők'},
    { key: 'perfume',   label: 'Illatszerek'},
  ];

  selectedCategory = 'all';
  searchQuery = '';
  sortBy = 'default';

  // ── Placeholder termékek (backend bekötésig)
  allProducts: Product[] = [
    { id: 1,  name: 'Velvet Noir Jacket',    category: 'clothing', price: 49990, originalPrice: 64990, rating: 4, reviewCount: 28, isNew: false },
    { id: 2,  name: 'Silk Evening Dress',    category: 'clothing', price: 39990,                       rating: 5, reviewCount: 14, isNew: true  },
    { id: 3,  name: 'Cashmere Overcoat',     category: 'clothing', price: 89990, originalPrice: 110000,rating: 4, reviewCount: 9,  isNew: false },
    { id: 4,  name: 'Linen Summer Blouse',   category: 'clothing', price: 18990,                       rating: 4, reviewCount: 21, isNew: true  },
    { id: 5,  name: 'Obsidian Runner',       category: 'shoes',    price: 34990, originalPrice: 42990, rating: 5, reviewCount: 37, isNew: false },
    { id: 6,  name: 'Suede Chelsea Boot',    category: 'shoes',    price: 44990,                       rating: 4, reviewCount: 18, isNew: true  },
    { id: 7,  name: 'Patent Leather Heel',   category: 'shoes',    price: 29990, originalPrice: 36990, rating: 4, reviewCount: 11, isNew: false },
    { id: 8,  name: 'Minimalist Sneaker',    category: 'shoes',    price: 24990,                       rating: 5, reviewCount: 44, isNew: false },
    { id: 9,  name: 'Ambre Nocturne',        category: 'perfume',  price: 19990, originalPrice: 24990, rating: 5, reviewCount: 62, isNew: false },
    { id: 10, name: 'Rose Éternelle',        category: 'perfume',  price: 24990,                       rating: 4, reviewCount: 33, isNew: true  },
    { id: 11, name: 'Cedar & Smoke',         category: 'perfume',  price: 17990, originalPrice: 21990, rating: 4, reviewCount: 19, isNew: false },
    { id: 12, name: 'White Musk Elixir',     category: 'perfume',  price: 22990,                       rating: 5, reviewCount: 28, isNew: true  },
  ];

  // ── Szűrt + rendezett lista
  get filteredProducts(): Product[] {
    let list = [...this.allProducts];

    if (this.selectedCategory !== 'all') {
      list = list.filter(p => p.category === this.selectedCategory);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q));
    }

    switch (this.sortBy) {
      case 'price-asc':  list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating':     list.sort((a, b) => b.rating - a.rating); break;
      case 'new':        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)); break;
    }

    return list;
  }

  // ── Csillagok
  getStarTypes(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating ? 'filled' : 'empty');
  }

  // ── Kedvezmény
  getDiscount(product: Product): number {
    if (!product.originalPrice) return 0;
    return Math.round((1 - product.price / product.originalPrice) * 100);
  }

  setCategory(key: string): void {
    this.selectedCategory = key;
  }
}