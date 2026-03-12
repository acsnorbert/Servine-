import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { ProductComponent } from './components/product/product.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { CategoriesComponent } from './components/Admin/categories/categories.component';
import { DashboardComponent } from './components/Admin/dashboard/dashboard.component';
import { OrderItemsComponent } from './components/Admin/order-items/order-items.component';
import { OrdersComponent } from './components/Admin/orders/orders.component';
import { UsersComponent } from './components/Admin/users/users.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    //SHOP
    { path: 'product', component: ProductComponent }, 

    //USER
    { path: 'profile', component: ProfileComponent }, 
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent },
    

    //ADMIN
    { path: 'category', component: CategoriesComponent }, 
    { path: 'dashboard', component: DashboardComponent }, 
    { path: 'order_items', component: OrderItemsComponent }, 
    { path: 'orders', component:OrdersComponent }, 
    { path: 'product', component: ProductComponent}, 
    { path: 'users', component: UsersComponent }, 
    
    
];
