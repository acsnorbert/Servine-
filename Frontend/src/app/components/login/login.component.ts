import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user';

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
    private router:Router
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
    if(!data.email || !data.password){
      alert("hiba")
      //this.messageService.show('warn', 'Warning', 'Hiányzó adatok!');
      return
    }
    this.api.login(data).subscribe({
      next: (res)=>{
        
        this.auth.login((res as any).token);
        if (this.keepLoggedIn) {
          this.auth.storeUser((res as any).token);
          
        }
        alert("sikeres login :)")
        //this.messageService.show('success', 'Success', 'Sikeres Bejelentkezés');
        this.router.navigateByUrl('/home');
      },
      error: (err)=>{
        alert("hiba")
        //this.messageService.show('error', 'Error', err.error?.error || 'Sikertelen bejelentkezés');
      }
    });
  }
}
