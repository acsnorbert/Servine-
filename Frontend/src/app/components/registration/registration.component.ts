import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';
import { MessageService } from '../../services/message.service';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration',
  standalone: true,
  imports: [
    FormsModule,
    RouterLink,
    CommonModule
  ],
  templateUrl: './registration.component.html',
  styleUrl: './registration.component.scss'
})
export class RegistrationComponent {
  constructor(
    private api: ApiService,
    private auth: AuthService,
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
  
  isLoading:boolean=false
  showTerms: boolean = false;

  openTerms(event: Event) {
    event.preventDefault();
    this.showTerms = true;
  }

  closeTerms() {
    this.showTerms = false;
  }

  async register() {
    if (this.isLoading) return;

    this.isLoading = true;
    //Hiányzó adatok ellenőrzése
    if(!this.user.name || !this.user.email || !this.user.password || !this.user.confirm){
       this.messageService.show('warn', 'FIGYELEM', 'Kérjük, töltse ki az összes űrlapot!');
       this.isLoading = false;
      return
    }
     //Email ellenőrzése
    if (!this.emailRegExp.test(this.user.email)) {
      this.messageService.show('error', 'HIBA', "Érvénytelen email formátum!");
      this.isLoading = false;
      return;
    }
    //Jelszó ellenőrzése
    if (!this.passwdRegExp.test(this.user.password)) {
      this.messageService.show('error', 'HIBA', "A jelszónak legalább 8 karakter hosszúnak kell lennie, tartalmaznia kell kis- és nagybetűket, valamint számokat!");
      this.isLoading = false;
      return;
    }
    //Jelszavak ugyanazok-e
    if (this.user.password !== this.user.confirm) {
      this.messageService.show('error', 'HIBA', "A két jelszó nem ugyanaz!");
      this.isLoading = false;
      return;
    }
    //Elfogadta a szolgáltatási feltételek
    if (!this.TermsAccept) {
      this.messageService.show('error', 'HIBA', "Kérjük, fogadja el a Szolgáltatási Feltételeket!");
      this.isLoading = false;
      return;
    }
    await this.api.register(this.user).subscribe({
      
      next: (res)=>{
        
        this.login()
        this.isLoading = false;
      },
      error: (err)=>{
       
        this.messageService.show('error', 'HIBA', err.error?.message || "Hiba történt regisztráció közben" );
        this.isLoading = false;
      }
    });

    
}
login(){
  this.api.login(this.user).subscribe({
      
      next: (res)=>{
        this.auth.login((res as any).token, (res as any).user);
        this.auth.storeUser((res as any).token);
          
        this.messageService.show('success', 'SIKER', 'Sikeresen regisztrált');
        this.router.navigateByUrl('/home');
      },
      error: (err)=>{
      }
    });
}
}
