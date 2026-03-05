import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService, UserProfile, Order } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';

// =====================
// CUSTOM VALIDATOR
// =====================
function passwordMatchValidator(group: AbstractControl): ValidationErrors | null {
  const newPw   = group.get('newPassword')?.value;
  const confirm = group.get('confirmPassword')?.value;
  return newPw && confirm && newPw !== confirm ? { mismatch: true } : null;
}

// =====================
// COMPONENT
// =====================
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DecimalPipe,
    RouterLink
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(24px)' }),
        animate('420ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProfileComponent implements OnInit {

  // ── Tab ───────────────────────────────────────
  activeTab: 'personal' | 'orders' | 'security' = 'personal';

  // ── Adatok ────────────────────────────────────
  profile: UserProfile | null = null;
  orders: Order[] = [];
  isLoading = true;

  // ── Toast ─────────────────────────────────────
  toastVisible  = false;
  toastMessage  = '';
  toastIsError  = false;
  private toastTimer: any;

  // ── Forms ─────────────────────────────────────
  profileForm!:  FormGroup;
  addressForm!:  FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadProfile();
    this.loadOrders();
  }

  // ── Form inicializálás ────────────────────────
  private initForms(): void {
    this.profileForm = this.fb.group({
      name:  ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
    });

    this.addressForm = this.fb.group({
      address: [''],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword:     ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
    }, { validators: passwordMatchValidator });
  }

  // ── API: Profil betöltése ─────────────────────
  private loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (profile) => {
        this.profile = profile;
        this.isLoading = false;
        this.profileForm.patchValue({
          name:  profile.name,
          email: profile.email,
          phone: profile.phone ?? '',
        });
        this.addressForm.patchValue({
          address: profile.address ?? '',
        });
      },
      error: () => {
        this.isLoading = false;
        this.showToast('Nem sikerült betölteni a profilt.', true);
      }
    });
  }

  // ── API: Rendelések betöltése ─────────────────
  private loadOrders(): void {
    this.userService.getMyOrders().subscribe({
      next: (orders) => { this.orders = orders; },
      error: ()       => { this.orders = []; }
    });
  }

  // ── Tab váltás ────────────────────────────────
  setTab(tab: 'personal' | 'orders' | 'security'): void {
    this.activeTab = tab;
  }

  // ── Avatar monogram ───────────────────────────
  getInitials(): string {
    const name = this.profileForm.get('name')?.value ?? this.profile?.name ?? '';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.[0] ?? '?').toUpperCase();
  }

  // ── Aktív kiszállítások száma ─────────────────
  getActiveShipments(): number {
    return this.orders.filter(o => o.status === 'Szállítás alatt').length;
  }

  // ── Rendelés státusz CSS osztály ──────────────
  getStatusClass(status: string): string {
    const map: Record<string, string> = {
      'Kézbesítve':        'status-delivered',
      'Szállítás alatt':   'status-shipped',
      'Feldolgozás alatt': 'status-processing',
    };
    return map[status] ?? 'status-processing';
  }

  // ── Rendelés összeg számítás ──────────────────
  getOrderTotal(order: Order): number {
    if (order.total) return order.total;
    return order.items?.reduce((sum, i) => sum + i.price * i.quantity, 0) ?? 0;
  }

  // ── Dátum formázás ────────────────────────────
  formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('hu-HU', { year: 'numeric', month: 'long', day: 'numeric' });
  }

  // ── Profil mentése ────────────────────────────
  savePersonal(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.userService.updateProfile(this.profileForm.value).subscribe({
      next: (res) => {
        this.profile = res.user;
        this.showToast('Személyes adatok mentve!');
      },
      error: () => this.showToast('Mentés sikertelen.', true)
    });
  }

  // ── Cím mentése ───────────────────────────────
  saveAddress(): void {
    this.userService.updateProfile({
      name:    this.profileForm.get('name')?.value,
      email:   this.profileForm.get('email')?.value,
      address: this.addressForm.get('address')?.value,
    }).subscribe({
      next: () => this.showToast('Szállítási cím mentve!'),
      error: () => this.showToast('Mentés sikertelen.', true)
    });
  }

  // ── Jelszó mentése ────────────────────────────
  savePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { currentPassword, newPassword } = this.passwordForm.value;
    this.userService.changePassword({ currentPassword, newPassword }).subscribe({
      next: () => {
        this.showToast('Jelszó sikeresen megváltoztatva!');
        this.passwordForm.reset();
      },
      error: (err) => {
        const msg = err?.error?.message ?? 'Jelszócsere sikertelen.';
        this.showToast(msg, true);
      }
    });
  }

  // ── Fiók törlése ──────────────────────────────
  deleteAccount(): void {
    const confirmed = window.confirm('Biztosan törölni szeretnéd a fiókodat? Ez a művelet visszavonhatatlan.');
    if (confirmed) {
      console.log('Fiók törlése...');
    }
  }

  // ── Kijelentkezés ─────────────────────────────
  logout(): void {
    this.authService.logout();
  }

  // ── Toast ─────────────────────────────────────
  private showToast(message: string, isError = false): void {
    this.toastMessage = message;
    this.toastIsError = isError;
    this.toastVisible = true;
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => { this.toastVisible = false; }, 3000);
  }
}