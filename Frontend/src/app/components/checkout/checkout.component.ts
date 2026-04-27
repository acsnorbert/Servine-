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

  // kartya mezok
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

  /** kartyatipus felismerese */
  get cardType(): 'visa' | 'mastercard' | null {
    const raw = this.cardNumber.replace(/\s/g, '');
    if (!raw) return null;
    if (/^4/.test(raw)) return 'visa';
    // Mastercard: 51–55 vagy 2221–2720
    if (
      /^5[1-5]/.test(raw) ||
      /^2(2[2-9][1-9]|[3-6]\d{2}|7[01]\d|720)/.test(raw)
    ) {
      return 'mastercard';
    }
    return null;
  }

  /** Kártyaszám formázása és csak számok engedése */
  formatCardNumber(e: any): void {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 16);
    this.cardNumber = raw.replace(/(.{4})/g, '$1 ').trim();
    // Visszaírjuk a formázott értéket az inputba
    e.target.value = this.cardNumber;
  }

  /** Lejárat formázása MM/ÉÉ formátumra, csak számokat enged */
  formatExpiry(e: any): void {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 4);
    if (raw.length >= 3) {
      this.cardExpiry = raw.substring(0, 2) + '/' + raw.substring(2);
    } else {
      this.cardExpiry = raw;
    }
    e.target.value = this.cardExpiry;
  }

  /** CVC: csak számokat enged */
  onCvcInput(e: any): void {
    const raw = e.target.value.replace(/\D/g, '').substring(0, 3);
    this.cardCvc = raw;
    e.target.value = raw;
  }

  onNameInput(e: any): void {
    const raw = e.target.value.replace(/[^a-zA-ZáéíóöőúüűÁÉÍÓÖŐÚÜŰ\s\-']/g, '');
    this.cardName = raw;
    e.target.value = raw;
  }

  placeOrder(): void {
    if (this.isSubmitting) return;

    if (!this.hasShippingAddress) {
      this.errorMessage =
        'Nincs megadott szállítási cím! Kérlek add meg a profilodban.';
      return;
    }

    // Kártyás fizetésnél validáció
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

      const rawNumber = this.cardNumber.replace(/\s/g, '');
      if (rawNumber.length < 16) {
        this.errorMessage = 'Érvénytelen kártyaszám (16 számjegy szükséges).';
        return;
      }

      if (!this.cardType) {
        this.errorMessage = 'Csak Visa vagy Mastercard kártyát fogadunk el.';
        return;
      }

      // Lejárat formátum ellenőrzés MM/ÉÉ
      if (!/^\d{2}\/\d{2}$/.test(this.cardExpiry)) {
        this.errorMessage = 'Érvénytelen lejárati dátum (pl. 08/27).';
        return;
      }

      if (this.cardCvc.length < 3) {
        this.errorMessage = 'Érvénytelen CVC kód.';
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
}
