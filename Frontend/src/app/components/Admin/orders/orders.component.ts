import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {

  search = '';

  orders = [
    {
      id: 1,
      user_id: 10,
      order_date: new Date('2026-03-20 14:30'),
      status: 'Feldolgozás alatt'
    },
    {
      id: 2,
      user_id: 11,
      order_date: new Date('2026-03-21 09:10'),
      status: 'Kész'
    },
    {
      id: 3,
      user_id: 12,
      order_date: null,
      status: 'Törölve'
    }
  ];

  edit(order: any) {
    console.log('edit', order);
  }

  delete(id: string) {
    console.log('delete', id);
  }
}