import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Product } from '../interfaces/product';

export interface CartItem {
  product: Product;
  size: string | null;
  quantity: number;
}

const GUEST_KEY = 'cart_guest';

function cartKey(userId: string | number): string {
  return `cart_${userId}`;
}

@Injectable({ providedIn: 'root' })
export class CartService {
  private currentKey: string = GUEST_KEY;
  private cartItems: CartItem[] = [];
  private cartSubject = new BehaviorSubject<CartItem[]>([]);
  cart$ = this.cartSubject.asObservable();

  // storage
  private loadFromStorage(key: string): CartItem[] {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private saveToStorage(): void {
    localStorage.setItem(this.currentKey, JSON.stringify(this.cartItems));
  }

  private emit(): void {
    this.cartSubject.next([...this.cartItems]);
    this.saveToStorage();
  }

  // user bejelentkezeskor hivando
  switchToUser(userId: string | number): void {
    const key = cartKey(userId);
    this.currentKey = key;
    this.cartItems = this.loadFromStorage(key);
    this.cartSubject.next([...this.cartItems]);
  }

  // guestkosar --> uj user
  mergeGuestCartToUser(userId: string | number): void {
    const guestItems = this.loadFromStorage(GUEST_KEY);
    if (guestItems.length === 0) return;

    const key = cartKey(userId);
    const userItems = this.loadFromStorage(key);

    for (const guestItem of guestItems) {
      const existing = userItems.find(
        (i) => i.product.id === guestItem.product.id && i.size === guestItem.size
      );
      if (existing) {
        existing.quantity += guestItem.quantity;
      } else {
        userItems.push(guestItem);
      }
    }

    localStorage.setItem(key, JSON.stringify(userItems));
    localStorage.removeItem(GUEST_KEY);

    // ha epp ez az aktiv user
    if (this.currentKey === key) {
      this.cartItems = userItems;
      this.cartSubject.next([...this.cartItems]);
    }
  }

  // kijelentkezeskor torlodik a kosar
  clearCartDisplay(): void {
    this.currentKey = GUEST_KEY;
    this.cartItems = [];
    this.cartSubject.next([]);
  }

  // kosar muveletek
  addToCart(product: Product, size: string | null, quantity: number): void {
    const existing = this.cartItems.find(
      (i) => i.product.id === product.id && i.size === size
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

  restoreCart(): void {
    this.cartItems = this.loadFromStorage(this.currentKey);
    this.cartSubject.next([...this.cartItems]);
  }
}