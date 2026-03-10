import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, RouterLink],
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
export class ProductComponent {

  // Termékadatok - Még beégetett adatokkal
  product = {
    name: 'Teszt Ruha 1',
    category: 'Póló',
    price: 49990,
    originalPrice: 64990,
    description: 'Egy időtlen darab, amely a modern elegancia és a klasszikus szabás tökéletes ötvözete. Prémium anyagból készült, kézzel varrott részletekkel.',
    rating: 4,
    reviewCount: 28,
    images: ['', '', '', '']
  };

  sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  selectedSize: string | null = null;
  selectedImageIndex = 0;
  quantity = 1;
  activeTab: 'description' | 'reviews' = 'description';
  isFavorite = false;


  // Értékelések - Még beégetett adatokkal
  reviews = [
    { author: 'Kovács Anna',  rating: 5, date: '2025. január 12.',    comment: 'Gyönyörű darab, pontosan olyan mint a képen. A minőség lenyűgöző, nagyon ajánlom!' },
    { author: 'Tóth Péter',   rating: 4, date: '2025. január 3.',     comment: 'Szép anyag, jó szabás. Egy mérettel nagyobbat rendeltem mint szoktam, tökéletes lett.' },
    { author: 'Nagy Eszter',  rating: 4, date: '2024. december 28.',  comment: 'Elegáns és kényelmes egyszerre. Pontosan kerestem ilyet.' },
  ];

  // Csillagok: 'filled' vagy 'empty' tömb visszaadása
  getStarTypes(rating: number): string[] {
    return [1, 2, 3, 4, 5].map(i => i <= rating ? 'filled' : 'empty');
  }

  getDiscount(): number {
    return Math.round((1 - this.product.price / this.product.originalPrice) * 100);
  }

  selectSize(size: string): void {
    this.selectedSize = size;
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  increaseQty(): void {
    if (this.quantity < 10) this.quantity++;
  }

  decreaseQty(): void {
    if (this.quantity > 1) this.quantity--;
  }

  toggleFavorite(): void {
    this.isFavorite = !this.isFavorite;
  }

  addToCart(): void {
    console.log('Kosárba:', this.product.name, '| Méret:', this.selectedSize, '| Db:', this.quantity);
  }
}