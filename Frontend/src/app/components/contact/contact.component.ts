import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';

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

  submitted  = false;
  submitting = false;

  send(): void {
    if (!this.name || !this.email || !this.message) return;
    this.submitting = true;
    setTimeout(() => {
      this.submitting = false;
      this.submitted  = true;
      this.name = this.email = this.subject = this.message = '';
    }, 1200);
  }
}