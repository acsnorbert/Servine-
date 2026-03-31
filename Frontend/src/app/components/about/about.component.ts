import { Component } from '@angular/core';
import { NgFor } from '@angular/common';
import { RouterLink } from '@angular/router';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [NgFor, RouterLink],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.scss'],
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(32px)' }),
        animate('600ms cubic-bezier(0.16, 1, 0.3, 1)',
          style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class AboutComponent {

  team = [
    {
      name: 'Jelencsity Miklós',
      role: 'Backend fejlesztő',
      desc: 'Adatbázis-kezelés, REST API, szerver oldali logika.',
      initial: 'JM'
    },
    {
      name: 'Ács Norbert',
      role: 'Frontend fejlesztő',
      desc: 'Felhasználói felület, Angular komponensek, UX design.',
      initial: 'ÁN'
    },
    {
      name: 'Ács Benjámin',
      role: 'Admin & Tesztelés',
      desc: 'Admin felület fejlesztése, készletkezelés, tesztelés.',
      initial: 'ÁB'
    }
  ];

  values = [
    { icon: '✦', title: 'Minőség',    desc: 'Minden termékünket gondosan válogatjuk, hogy csak a legjobb kerüljön hozzád.' },
    { icon: '◈', title: 'Elegancia',  desc: 'Hiszünk abban, hogy a stílus nem luxus, hanem önkifejezés.' },
    { icon: '❖', title: 'Bizalom',    desc: 'Átlátható árazás, megbízható szállítás, elégedett vásárlók.' },
    { icon: '⬡', title: 'Fenntarthatóság', desc: 'Tudatos vásárlás, etikus gyártás és felelős csomagolás.' },
  ];
}