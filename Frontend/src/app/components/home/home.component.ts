import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProductCard {
  name: string;
  sub: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
})
export class HomeComponent {

  products: ProductCard[] = [
    { name: 'NOIR',    sub: 'Eau de Parfum'     },
    { name: 'LUMIÈRE', sub: 'Eau de Toilette'   },
    { name: 'VELOURS', sub: 'Extrait de Parfum' },
  ];

  activeIndex = 0;      // aktív kártya indexe
  animating   = false;  // dupla kattintás blokkolása

  // visszaadja az összes kártyát a helyes sorrendben,
  // az aktív mindig a középső (index 1) pozícióban van
  get orderedCards(): { card: ProductCard; origIndex: number }[] {
    const len = this.products.length;
    const left  = (this.activeIndex - 1 + len) % len;
    const right = (this.activeIndex + 1) % len;
    return [
      { card: this.products[left],             origIndex: left             },
      { card: this.products[this.activeIndex], origIndex: this.activeIndex },
      { card: this.products[right],            origIndex: right            },
    ];
  }

  // eggyel visszalép, körkörösen — jobbra csúszik
  prev(): void {
    if (this.animating) return;
    this.animating = true;
    const len = this.products.length;
    this.activeIndex = (this.activeIndex - 1 + len) % len;
    setTimeout(() => { this.animating = false; }, 420);
  }

  // eggyel előrelép, körkörösen — balra csúszik
  next(): void {
    if (this.animating) return;
    this.animating = true;
    this.activeIndex = (this.activeIndex + 1) % this.products.length;
    setTimeout(() => { this.animating = false; }, 420);
  }
}