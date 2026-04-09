import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { MessageService } from '../../services/message.service';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  constructor(
     private api: ApiService,
    private router: Router,
    private messageService: MessageService,
  ){}
  user:User={
    name: '',
    email: '',
    password: '',
    confirm:''
  }
  passwdRegExp = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
  emailRegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  TermsAccept = false;
  

  register() {
    //Hiányzó adatok ellenőrzése
    if(!this.user.name || !this.user.email || !this.user.password || !this.user.confirm){
       this.messageService.show('warn', 'Warning', 'Please fill in all the forms!');
      return
    }
     //Email ellenőrzése
    if (!this.emailRegExp.test(this.user.email)) {
      this.messageService.show('error', 'Error', "Invalid email format!");
      return;
    }
    //Jelszó ellenőrzése
    if (!this.passwdRegExp.test(this.user.password)) {
      this.messageService.show('error', 'Error', "The password must be at least 8 characters long, contain uppercase and lowercase letters, and numbers!");
      return;
    }
    //Jelszavak ugyanazok-e
    if (this.user.password !== this.user.confirm) {
      this.messageService.show('error', 'Hiba', "The two passwords are not the same.!");
      return;
    }
    //Elfogadta a szolgáltatási feltételek
    if (!this.TermsAccept) {
      this.messageService.show('error', 'Error', "Please accept the Terms of Service!");
      return;
    }
    this.api.register(this.user).subscribe({
      
      next: (res)=>{
        this.messageService.show('success', 'Success', 'Sikeres regisztráció');
        this.router.navigateByUrl('/login');
      },
      error: (err)=>{
       
        this.messageService.show('error', 'Error', err.error?.message || "There was an error during registration" );
      }
    });

    
}
}
