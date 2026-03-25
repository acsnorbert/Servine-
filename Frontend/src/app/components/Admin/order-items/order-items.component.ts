import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-order-items',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule
  ],
  templateUrl: './order-items.component.html',
  styleUrl: './order-items.component.scss'
})
export class OrderItemsComponent {

  search = '';

  orderItems = [
    {
      id: 1,
      order_id: 1,
      product_id: 2,
      quantity: 2,
      price: 129.00
    },
    {
      id: 2,
      order_id: 1,
      product_id: 3,
      quantity: 1,
      price: 139.00
    },
    {
      id: 3,
      order_id: 2,
      product_id: 1,
      quantity: 3,
      price: 99.00
    }
  ];

  edit(item: any) {
    console.log('edit', item);
  }

  delete(id: number) {
    console.log('delete', id);
  }
}