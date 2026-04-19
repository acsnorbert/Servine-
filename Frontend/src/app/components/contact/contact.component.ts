import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../enviroments/environment';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [NgIf, FormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(28px)' }),
        animate('500ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ContactComponent {

  name    = '';
  email   = '';
  subject = '';
  message = '';

  submitted    = false;
  submitting   = false;
  errorMessage = '';

  constructor(private http: HttpClient) {}

  send(): void {
    if (!this.name || !this.email || !this.message) return;
    this.submitting   = true;
    this.errorMessage = '';

    const body = {
      to: environment.contactEmail,
      subject: this.subject
        ? `[SERVINE Kapcsolat] ${this.subject}`
        : '[SERVINE Kapcsolat] Új üzenet',
      message: `
        <p><strong>Feladó neve:</strong> ${this.name}</p>
        <p><strong>Feladó emailje:</strong> ${this.email}</p>
        <p><strong>Üzenet:</strong></p>
        <p>${this.message.replace(/\n/g, '<br>')}</p>
      `
    };

    this.http.post(`${environment.serverUrl}/api/mail/send`, body).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted  = true;
        this.name = this.email = this.subject = this.message = '';
      },
      error: () => {
        this.submitting   = false;
        this.errorMessage = 'Hiba történt az üzenet küldésekor. Kérlek próbáld újra!';
      }
    });
  }
}