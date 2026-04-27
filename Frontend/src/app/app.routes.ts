import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { ProductComponent } from './components/product/product.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CategoriesComponent } from './components/Admin/categories/categories.component';
import { DashboardComponent } from './components/Admin/dashboard/dashboard.component';
import { OrdersComponent } from './components/Admin/orders/orders.component';
import { UsersComponent } from './components/Admin/users/users.component';
import { ProductsComponent } from './components/Admin/products/products.component';
import { CartComponent } from './components/cart/cart.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutComponent } from './components/about/about.component';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';
import { CheckoutComponent } from './components/checkout/checkout.component';
import { OrderSuccessComponent } from './components/order-success/order-success.component';
import { adminGuard } from './guards/admin.guard';
import { userGuard } from './guards/user.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

  // PUBLIC
  { path: 'login', component: LoginComponent, canActivate:[userGuard] },
  { path: 'registration', component: RegistrationComponent, canActivate:[userGuard] },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },
  { path: 'checkout', component: CheckoutComponent, canActivate: [authGuard] },

  // BEJELENTKEZÉS SZÜKSÉGES
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },
  { path: 'order-success', component: OrderSuccessComponent, canActivate: [authGuard] },

  // ADMIN ONLY
  { path: 'dashboard', component: DashboardComponent, canActivate: [adminGuard] },
  { path: 'category', component: CategoriesComponent,canActivate: [adminGuard] },
  { path: 'orders', component: OrdersComponent,canActivate: [adminGuard]},
  { path: 'product_list', component: ProductsComponent,canActivate: [adminGuard]},
  { path: 'users', component: UsersComponent,canActivate: [adminGuard]},

  // 404
  { path: '**', component: NotFoundComponent },
];