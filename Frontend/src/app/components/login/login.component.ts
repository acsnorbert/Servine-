import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
   FormsModule,
   RouterLink
    
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
    private router:Router,
    private messageService: MessageService,
  ){}
  keepLoggedIn: boolean =false;
  user:User={
    name: '',
    email: '',
    password: ''
  }
  email: string = '';
  password: string = '';
  


   login(){
    
    let data = {
      email: this.user.email,
      password: this.user.password
    }
    //Hiányzó adatok ellenőrzése
    if(!data.email || !data.password){
      
      this.messageService.show('warn', 'Warning', 'Please fill in all the forms!');
      return
    }
    this.api.login(data).subscribe({
      next: (res)=>{
        this.auth.login((res as any).token, (res as any).user);
        if (this.keepLoggedIn) {
          this.auth.storeUser((res as any).token);
          
        }
        this.messageService.show('success', 'Success', 'Successful Login');
        this.router.navigateByUrl('/home');
      },
      error: (err)=>{
        
        this.messageService.show('error', 'Error', err.error?.message || 'There was an error during login');
      }
    });
  }
}
