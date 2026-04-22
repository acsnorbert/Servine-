import {
  Component,
  OnInit,
  HostListener,
  inject,
  effect,
  DestroyRef,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CartService } from '../../services/cart.service';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  cartItemCount = 0;
  isloggedin = false;
  isAdmin = false;
  menuOpen = false;
  isScrolled = false;
  cartBump = false;

  private authService = inject(AuthService);
  private cartService = inject(CartService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      this.isloggedin = !!user;
      this.isAdmin = user?.role === 'admin';
    });
  }

  ngOnInit(): void {
    this.cartService.cart$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => {
        const newCount = items.reduce(
          (total, item) => total + item.quantity,
          0,
        );

        if (newCount > this.cartItemCount) {
          this.cartBump = false;
          setTimeout(() => {
            this.cartBump = true;
          }, 10);
          setTimeout(() => {
            this.cartBump = false;
          }, 600);
        }

        this.cartItemCount = newCount;
      });

    this.authService.isLoggedIn$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((isLogged) => {
        this.isloggedin = isLogged;
        if (!isLogged) this.isAdmin = false;
      });
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
    document.body.style.overflow = this.menuOpen ? 'hidden' : '';
  }

  closeMenu(): void {
    this.menuOpen = false;
    document.body.style.overflow = '';
  }

  @HostListener('window:scroll')
  onScroll(): void {
    this.isScrolled = window.scrollY > 40;
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen) this.closeMenu();
  }
}
