import { Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { ProfileComponent } from './components/profile/profile.component';
import { LoginComponent } from './components/login/login.component';
import { ProductComponent } from './components/product/product.component';
import { RegistrationComponent } from './components/registration/registration.component';

export const routes: Routes = [
    { path: '', component: HomeComponent },
    { path: 'profile', component: ProfileComponent }, 
    { path: 'login', component: LoginComponent },
    { path: 'registration', component: RegistrationComponent },
    { path: 'product', component: ProductComponent }, 


];
