import { Component, OnInit } from '@angular/core';
import { NgFor, NgIf, DecimalPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router'; 
import { CartService, CartItem } from '../../services/cart.service';
import { OrderItemsService } from '../../services/order-items.service'; 

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
    // 2. JAVÍTÁS: Itt injektáljuk be a te meglévő szervizedet
    private orderItemsService: OrderItemsService, 
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

  calculateTotal(): void {
    this.totalPrice = this.cartItems.reduce((acc, item) => {
      return acc + (item.product.price * item.quantity);
    }, 0);
  }

  checkout(): void {
    if (this.cartItems.length === 0) return;
    this.isSubmitting = true;

    // Összeállítjuk az adatokat.
    const orderPayload = {
      // Itt az aktuális user ID-t kell majd átadni (most 1-esként küldjük tesztből)
      user_id: 1, 
      items: this.cartItems.map(item => ({
        product_id: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
        size: item.size 
      }))
    };

    // 3. JAVÍTÁS: A te szervized 'insertOrderItem' metódusát hívjuk meg
    this.orderItemsService.insertOrderItem(orderPayload).subscribe({
      next: (response: any) => {
        alert('Sikeres rendelés!');
        this.cartService.clearCart(); 
        this.isSubmitting = false;
        this.router.navigate(['/products']); 
      },
      error: (err: any) => {
        console.error('Hiba történt a rendelés során:', err);
        alert('Sajnos hiba történt a rendelés leadásakor.');
        this.isSubmitting = false;
      }
    });
  }
}