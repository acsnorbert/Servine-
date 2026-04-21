import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { MessageService } from '../../services/message.service';
import { Order } from '../../interfaces/order';
import { User } from '../../interfaces/user';

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
  profile: User | null = null;
  orders: Order[] = [];
  isLoading = true;



  // ── Forms ─────────────────────────────────────
  profileForm!:  FormGroup;
  addressForm!:  FormGroup;
  passwordForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private userService: UserService,
    private authService: AuthService,
    private messageService: MessageService
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
        this.messageService.show('error', 'Error', 'Nem sikerült betölteni a profilt.');
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
    if (order.total_price) return order.total_price;
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
      this.messageService.show('success', 'Success', 'Sikeres személyes adatok mentés');
    },
    error: (err) => {
  this.messageService.show('error', 'HIBA', err.error?.message || 'Mentés sikertelen.');
  }
  });
}

  // ── Cím mentése ───────────────────────────────
  saveAddress(): void {
    this.userService.updateProfile({
      name:    this.profileForm.get('name')?.value,
      email:   this.profileForm.get('email')?.value,
      address: this.addressForm.get('address')?.value,
    }).subscribe({
      next: () => this.messageService.show('success', 'Success', 'Sikeres cím mentés'),
      error: () => this.messageService.show('error', 'Error', 'Mentés sikertelen.')
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
        this.messageService.show('success', 'Success', 'Sikeres jelszócsere');
        this.passwordForm.reset();
      },
      error: (err) => {
        this.messageService.show('error', 'Error', "Sikertelen!");
      }
    });
  }

  // ── Fiók törlése ──────────────────────────────
  deleteAccount(): void {
  const confirmed = window.confirm('Biztosan törölni szeretnéd a fiókodat? Ez a művelet visszavonhatatlan.');
  if (confirmed) {
    this.userService.deleteAccount().subscribe({
      next: () => this.authService.logout(),
      error: () => this.messageService.show('error', 'Error', 'Törlés sikertelen.')
    });
  }
}

  // ── Kijelentkezés ─────────────────────────────
  logout(): void {
    this.authService.logout();
  }

  // ── Modal ─────────────────────────────────────
selectedOrder: Order | null = null;
isModalOpen = false;
isModalLoading = false;

openOrderModal(order: Order): void {
  this.selectedOrder = order;
  this.isModalOpen = true;

  // Ha az items már be van töltve, nem kell újra lekérni
  if (order.items && order.items.length > 0) return;

  this.isModalLoading = true;
  this.userService.getOrderById(order.id!).subscribe({
    next: (fullOrder) => {
      this.selectedOrder = fullOrder;
      this.isModalLoading = false;
    },
    error: () => {
      this.isModalLoading = false;
      this.messageService.show('error', 'Error', 'Nem sikerült betölteni a rendelés részleteit.');
    }
  });
}

closeModal(): void {
  this.isModalOpen = false;
  this.selectedOrder = null;
}
  
}