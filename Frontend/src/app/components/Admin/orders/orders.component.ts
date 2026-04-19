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
import { firstValueFrom } from 'rxjs';

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
  totalPrice: number = 0;
 


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
  data:any;
  itemsDialog = false;

  ogquantity:any
  //Lista szűrése felhasználói email alapján
  get filteredOrders(): Order[] {
      const term = this.search.toLowerCase();
  
      return this.orders.filter(cat =>
        cat.user?.email.toLowerCase().includes(term)
      );
    }
  
  //Rendelési tételek darabszámának lehívása
  async getQuantity(id: string): Promise<number> {
  try {
    const res: any = await firstValueFrom(
      this.orderItemApi.getOrderItemQuantityById(id)
    );
    this.ogquantity = res.quantity;
    return res.quantity;
  } catch (err: any) {
    this.ogquantity = 0;
    this.messageService.show('error','HIBA', err.message?.error || 'Hiba történt');
    return 0;
  }
}
  //Rendelési tárgyak Dialogjának megnyitása
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
  async productRefund(id: string, quantity: number, action: boolean) {
  try {
    const res = await firstValueFrom(this.productApi.getProductById(id));
    this.product = res as Product;

    if (action) {
      // levonás
      if (this.product.stock < quantity) {
        this.messageService.show('error', 'HIBA', 'Nincs elég készlet');
        return false;
      }
      this.product.stock -= quantity;
    } else {
      // visszaadás
      this.product.stock += quantity;
    }

    await firstValueFrom(this.productApi.updateProduct(this.product, id));
    return true;

    } catch (err: any) {
      this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt');
      return false;
    }
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
            this.api.UpdateTotalPrice(item.order_id!).subscribe();
            this.getOrders();
            this.getOrderItems();
            this.itemsDialog = true;
            
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
  statusChange(id: string,status: string) {
    switch(status){
      case "Feldolgozás alatt":
        status ="Kész"
        break;
      case "Kész":
        status = "Törölve";
        break;
      case "Törölve":
        status = "Feldolgozás alatt"
        break;
      default:
        status = "Feldolgozás alatt"
        break;
    }
    this.data={
      status
    }
    this.api.UpdateOrderStatus(id, this.data).subscribe({
          next: () => {
            this.messageService.show('success', 'SUCCESS', 'A rendelés státusza sikeresen frissült');
           
            this.getOrders();
          },
          error: (err: any) => {
            this.messageService.show('error', 'ERROR', err.message?.error || 'Hiba történt a rendelés státuszának megváltoztatásakor');
          
    } }); 
   }
  

  delete(id: string) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this order?|: ${name}`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        this.api.DeleteOrder(id).subscribe({
          next: () => {
            this.messageService.show('success', 'SUCCESS', 'The order was successfully deleted');
           
            this.getOrders();
          },
          error: (err: any) => {
            this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while deleting the order');
          
          }
        });
      }
    });
  }
  //Rendelési tárgyak frissítése
  async saveItems(item: Order_item) {
    const quantity = await this.getQuantity(item.id!);

    if (item.quantity <= 0) {
      this.confirmationService.confirm({
        message: `Biztosan törlöd?: ${item.product?.name}`,
        header: 'Megerősítés',
        icon: 'pi pi-exclamation-triangle',
        accept: async () => {

          const ok = await this.productRefund(item.product?.id!, quantity, false);
          if (!ok) return;

          await firstValueFrom(this.orderItemApi.deleteOrderItemById(item.id!));

          this.messageService.show('success', 'SIKER', 'Törölve!');
          this.itemsDialog = false;
          this.api.UpdateTotalPrice(item.order_id!).subscribe();
          this.getOrders();
          this.getOrderItems();
          
        }
      });
    } else {
      const ok = await this.productRefund(item.product?.id!, item.quantity-quantity, true);
      if (!ok) return;

      await firstValueFrom(this.orderItemApi.updateOrderItem(item, item.id!));

      this.messageService.show('success', 'SIKER', 'Frissítve!');
      this.api.UpdateTotalPrice(item.order_id!).subscribe();
      this.getOrders();
      this.getOrderItems();
      
    }
    

  
  }


}