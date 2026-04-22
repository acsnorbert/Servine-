// components/checkout/checkout.component.ts
import { Component, OnInit } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService, CartItem } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { MessageService } from '../../services/message.service';
import { UserService } from '../../services/user.service';
import { User } from '../../interfaces/user';

type PaymentMethod = 'card' | 'cod';
type Step = 'payment' | 'success';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, RouterLink, FormsModule],
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
})
export class CheckoutComponent implements OnInit {
  cartItems: CartItem[] = [];
  totalPrice = 0;
  paymentMethod: PaymentMethod = 'card';
  step: Step = 'payment';
  isSubmitting = false;
  errorMessage = '';
  orderId = '';
  userProfile: User | null = null;
  hasShippingAddress = false;

  // Kártya mezők (szimuláció)
  cardNumber = '';
  cardName = '';
  cardExpiry = '';
  cardCvc = '';

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    private messageService: MessageService,
    private userService: UserService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    this.cartService.cart$.subscribe((items) => {
      this.cartItems = items;
      if (items.length === 0 && this.step === 'payment') {
        this.router.navigate(['/cart']);
      }
      this.totalPrice = items.reduce(
        (s, i) => s + i.product.price * i.quantity,
        0,
      );
    });
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.userProfile = profile;
        this.hasShippingAddress = !!(
          profile.address && profile.address.trim().length > 0
        );
      },
      error: () => {
        this.hasShippingAddress = false;
      },
    });
  }

  placeOrder(): void {
    if (this.isSubmitting) return;
    if (!this.hasShippingAddress) {
      this.errorMessage =
        'Nincs megadott szállítási cím! Kérlek add meg a profilodban.';
      return;
    }
    // Kártyás fizetésnél minimális validáció
    if (this.paymentMethod === 'card') {
      if (
        !this.cardNumber ||
        !this.cardName ||
        !this.cardExpiry ||
        !this.cardCvc
      ) {
        this.errorMessage = 'Kérlek töltsd ki az összes kártyaadatot!';
        return;
      }
    }

    this.isSubmitting = true;
    this.errorMessage = '';

    const items = this.cartItems.map((i) => ({
      product_id: (i.product as any).id,
      quantity: i.quantity,
      price: i.product.price,
    }));

    this.orderService.createOrder(items).subscribe({
      next: (res: any) => {
        this.orderId = res.order?.id ?? '';
        this.cartService.clearCart();
        this.step = 'success';
        this.isSubmitting = false;
        this.router.navigate(['/order-success'], {
          state: { order: { id: res.order.id, total: this.totalPrice } },
        });
      },
      error: (err) => {
        this.errorMessage =
          err?.error?.message ?? 'Hiba történt a rendelés leadásakor.';
        this.isSubmitting = false;
      },
    });
  }

  formatCardNumber(e: any): void {
    let v = e.target.value.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = v.replace(/(.{4})/g, '$1 ').trim();
  }
}
