import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { CartService, CartItem } from '../../services/cart.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [NgFor, NgIf, DecimalPipe, RouterLink],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  isSubmitting = false;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
    });
  }

  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
  }

  increaseQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item.quantity < item.product.stock) {
      item.quantity++;
      this.calculateTotal();
    }
  }

  decreaseQuantity(index: number): void {
    const item = this.cartItems[index];
    if (item.quantity > 1) {
      item.quantity--;
      this.calculateTotal();
    }
  }

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);
  }

  checkout(): void {
    if (this.cartItems.length === 0) return;
    this.router.navigate(['/checkout']);
  }
}