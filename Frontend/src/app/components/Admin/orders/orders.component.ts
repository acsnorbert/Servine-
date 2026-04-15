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
import { ProductService } from '../../../services/product.service';
import { Product } from '../../../interfaces/product';

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
    private productApi: ProductService,
    private messageService:MessageService ,
    private confirmationService: ConfirmationService 
  ){}
  ngOnInit(): void {
    this.getOrders();
  }

  orders:Order[] = [];
  selectedItems: Order_item[] = [];
  product: Product={
    category_id: '',
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    image: ''
  };
  itemsDialog = false;

  ogquantity:any

  async getQuantity(id: string) {
    this.orderItemApi.getOrderItemQuantityById(id).subscribe({
      next: (res: any) => {
        this.ogquantity = res.quantity;
        console.log(`${res.quantity}, ${this.ogquantity}` )
      },
      error: (err) => {
        this.ogquantity = 0;

        this.messageService.show(
          'error',
          'HIBA',
          err.message?.error || 'Hiba történt a rendelések lehívásakor'
        );
      }
    });
  }

  openItemsDialog(id:string, length:any) {
    if(length <= 0){
      this.messageService.show('info', 'INFO', 'Ennek a rendelésnek nincsenek tárgyai!');
    }
    else{
      this.orderItemApi.getOrderItemByOrderId(id).subscribe({
      next:(res)=>{
        this.selectedItems = res as Order_item[];
        
      },
      error:(err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a rendelések lehívásakor');
      }
    })
    
    this.itemsDialog = true;
    }
    
  }

  //Order állításnál visszaadja a stockba a tárgyat vagy elvesz ha van elég
  async productRefund(id:string, quantity:number, action:boolean){
    await this.productApi.getProductById(id).subscribe({
      next:(res)=>{
        this.product = res as Product;
        //MAJD KÉRD LE AZ ORDER ITEMS QUANTITYT MER A FORM NEM KONSZISZTENS
        if(action){
          this.product.stock -= quantity;
        }
        else{
          this.product.stock += quantity;
        }
        if(this.product.stock <=0){
          this.messageService.show('error', 'HIBA', 'Nincs elég tárgy');
          return;
        }
        this.productApi.updateProduct(this.product, id).subscribe({
          next:(res)=>{
          
          },
          error:(err)=>{
            this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a tárgy frissítésekor');
          }
        })
      },
      error:(err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a tárgy lehívásakor');
      }
    })
  }

  //Rendelési tárgy törlése
  async deleteItem(item: Order_item) {
    await this.getQuantity(item.id!)
    this.confirmationService.confirm({
      message: `Biztosan ki szeretnéd törölni ezt a rendelési tárgyat?|: ${item.product?.name}`,
      header: 'Megerősítés',
      icon: 'pi pi-exclamation-triangle',
      accept: async() => {
        
        await this.productRefund(item.product?.id!,this.ogquantity, false);
        this.orderItemApi.deleteOrderItemById(item.id!).subscribe({
          next: async() => {
            
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
      },
      error:(err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a rendelések lehívásakor');
      }
    })
  }
  getOrderItems(){
    this.api.getOrders().subscribe({
      next:(res)=>{
        this.orders = res as Order[];
       
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
  //Rendelési tárgyak frissítése
  async saveItems(item:Order_item) {
    //Ha 0-t rak

    if(item.quantity <=0){
      this.confirmationService.confirm({
      message: `Biztosan ki szeretnéd törölni ezt a rendelési tárgyat?|: ${item.product?.name}`,
      header: 'Megerősítés',
      icon: 'pi pi-exclamation-triangle',
      accept: async() => {
        await this.productRefund(item.product?.id!,item.quantity, false);
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
    else{
      //Frissítés
      this.orderItemApi.updateOrderItem(item, item.id!).subscribe({
      next:(res)=>{
        this.messageService.show('success', 'SIKER', 'A rendelési tárgy sikeresen frissítve!');
        this.getOrderItems()
        
      },
      error:(err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a rendelések lehívásakor');
       
      }
    })
    }
    
  }


}