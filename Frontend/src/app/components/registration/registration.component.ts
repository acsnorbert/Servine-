import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

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
   email = '';
  password = '';
  TermsAccept = false;
  name='';
  confpass = '';

  registration() {
    console.log(this.email, this.password, this.confpass, this.TermsAccept, this.name);
  }
}
