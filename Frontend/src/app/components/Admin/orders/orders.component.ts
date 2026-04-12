import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Order } from '../../../interfaces/order';
import { OrderService } from '../../../services/order.service';
import { MessageService } from '../../../services/message.service';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { ConfirmationService } from 'primeng/api';
import { Order_item } from '../../../interfaces/order_items';
import { OrderItemsService } from '../../../services/order-items.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule,
    ConfirmDialogModule,
    ButtonModule,
    DialogModule,
    DropdownModule
  ],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss',
  providers: [ConfirmationService]
})
export class OrdersComponent implements OnInit {



  search = '';
  constructor(
    private api: OrderService,
    private orderItemApi: OrderItemsService,
    private messageService:MessageService ,
    private confirmationService: ConfirmationService 
  ){}
  ngOnInit(): void {
    this.getOrders()
  }

  orders:Order[] = [];
  selectedItems: Order_item[] = [];

  itemsDialog = false;

  openItemsDialog(order: any) {
    this.selectedItems = order.items || [];
    this.itemsDialog = true;
  }
  selectItem(item: Order_item) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this category?|: ${item.product?.name}`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        this.orderItemApi.deleteOrderItemById(item.id!).subscribe({
          next: () => {
            this.messageService.show('success', 'SIKER', 'A rendelési tárgy sikeresen törölve!');
            this.itemsDialog = false;
            this.getOrders();
          },
          error: (err: any) => {
            this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a rendelési tárgy törlése közben!');
            this.itemsDialog = false;
          }
        });
      }
    });
  }

  getOrders(){
    this.api.getOrders().subscribe({
      next:(res)=>{
        this.orders = res as Order[];
        console.log(res)
      },
      error:(err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a rendelések lehívásakor');
      }
    })
  }
  edit(order: any) {
    console.log('edit', order);
  }

  delete(id: string) {
    console.log('delete', id);
  }
}