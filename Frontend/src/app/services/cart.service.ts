import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';

export interface CartItem {
  product: Product;
  size: string | null;
  quantity: number;
}

const CART_KEY = 'servine_cart';

@Injectable({ providedIn: 'root' })
export class CartService {
  private cartItems: CartItem[] = this.loadFromStorage();
  private cartSubject = new BehaviorSubject<CartItem[]>(this.cartItems);
  cart$ = this.cartSubject.asObservable();

  private loadFromStorage(): CartItem[] {
    try {
      const raw = localStorage.getItem(CART_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(CART_KEY, JSON.stringify(this.cartItems));
  }

  private emit(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveToStorage();
  }

  addToCart(product: Product, size: string | null, quantity: number): void {
    const existing = this.cartItems.find(
      i => i.product.id === product.id && i.size === size
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      this.cartItems.push({ product, size, quantity });
    }
    this.emit();
  }

  removeFromCart(index: number): void {
    this.cartItems.splice(index, 1);
    this.emit();
  }

  clearCart(): void {
    this.cartItems = [];
    this.emit();
  }

  getItems(): CartItem[] {
  return [...this.cartItems];
}
}