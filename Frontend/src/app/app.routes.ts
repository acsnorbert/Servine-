import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { ProductComponent } from './components/product/product.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { ProductListComponent } from './components/product-list/product-list.component';
import { CategoriesComponent } from './components/Admin/categories/categories.component';
import { DashboardComponent } from './components/Admin/dashboard/dashboard.component';
import { OrderItemsComponent } from './components/Admin/order-items/order-items.component';
import { OrdersComponent } from './components/Admin/orders/orders.component';
import { UsersComponent } from './components/Admin/users/users.component';
import { ProductsComponent } from './components/Admin/products/products.component';
import { CartComponent } from './components/cart/cart.component';
import { ContactComponent } from './components/contact/contact.component';
import { AboutComponent } from './components/about/about.component';
import { authGuard } from './guards/auth.guard';
import { NotFoundComponent } from './components/not-found/not-found.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },

  // PUBLIC
  { path: 'login', component: LoginComponent },
  { path: 'registration', component: RegistrationComponent },
  { path: 'products', component: ProductListComponent },
  { path: 'products/:id', component: ProductComponent },
  { path: 'contact', component: ContactComponent },
  { path: 'about', component: AboutComponent },

  // BEJELENTKEZÉS SZÜKSÉGES
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: 'cart', component: CartComponent, canActivate: [authGuard] },

  // ADMIN ONLY
  { path: 'dashboard', component: DashboardComponent },
  { path: 'category', component: CategoriesComponent },
  { path: 'order_items', component: OrderItemsComponent},
  { path: 'orders', component: OrdersComponent},
  { path: 'product_list', component: ProductsComponent},
  { path: 'users', component: UsersComponent},

  // 404
  { path: '**', component: NotFoundComponent },
];