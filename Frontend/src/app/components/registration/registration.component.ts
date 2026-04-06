import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { User } from '../../interfaces/user';

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
    //private messageService: MessageService,
  ){}
  user:User={
    name: '',
    email: '',
    password: '',
    confirm:''
  }
  
  TermsAccept = false;
  

  register() {
  
    if(!this.user.name || !this.user.email || !this.user.password || !this.user.confirm){
      alert("Hiányzó adatok")
      return
    }
    this.api.register(this.user).subscribe({
      
      next: (res)=>{
        //this.messageService.show('success', 'Success', 'Sikeres regisztráció');
        this.router.navigateByUrl('/login');
      },
      error: (err)=>{
       alert("Hiba")
        // this.messageService.show('error', 'Error', err.error?.error || 'Hiba történt regisztráció közben');
      }
    });

    
}
}
