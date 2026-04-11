import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { Product } from '../../../interfaces/product';
import { ConfirmationService } from 'primeng/api';
import { ProductService } from '../../../services/product.service';
import { MessageService } from '../../../services/message.service';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../interfaces/category';


@Component({
  selector: 'app-products',
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
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss',
  providers: [ConfirmationService]
})
export class ProductsComponent implements OnInit {

  constructor(
    private api: ProductService,
    private catApi: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ){}


  search = '';
displayDialog: any;
isEditMode: any;
  ngOnInit(): void {
    this.getProducts();
    this.getCategories();
  }
  categories: Category[]=[]
  newProduct: Product={
    category_id: '',
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    image: ''
  }
  products:Product[] = [];
  get filteredProducts(): Product[] {
    const term = this.search.toLowerCase();

    return this.products.filter(product =>
      product.name.toLowerCase().includes(term)
    );
  }
   
  getProducts(){
    this.api.getProducts().subscribe({
      next: (res)=>{
        this.products = res as Product[];
      },
      error: (err)=>{
        this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while finding the categories');
      }

    })
  }
  getCategories() {
    this.catApi.getCategories().subscribe({
      next: (res) => {
        this.categories = res as Category[];
      },
      error: (err)=>{
        this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while finding the categories');
      }
    });
  }
  edit(product:any){
     this.isEditMode = true;
    this.newProduct = { ...product };
    this.displayDialog = true;
  }
  add() {
    this.isEditMode = false;
    this.newProduct = {
      id:'',
      category_id: '',
      name: '',
      price: 0,
      stock: 0,
      sku: '',
      image: '' };
    this.displayDialog = true;
    }
  save() {
    if (this.isEditMode) {
      console.log('UPDATE', this.newProduct);
      this.api.updateProduct(this.newProduct, this.newProduct.id!).subscribe({
      next: () => {
        this.messageService.show('success', 'SUCCESS', 'Product was successfully updated');
         this.getProducts();
      },
      error: (err)=>{
        this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while finding the categories');
      }
    });
    } else {
      this.api.insertProduct(this.newProduct).subscribe({
      next: () => {
        this.messageService.show('success', 'SUCCESS', 'Product was successfully created');
         this.getProducts();
      },
      error: (err)=>{
        this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while finding the categories');
      }
    });
    }

    this.displayDialog = false;
  }

  delete(id:string, name:string){
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this product?|: ${name}`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        this.api.deleteProductById(id).subscribe({
          next: () => {
            this.messageService.show('success', 'SUCCESS', 'The product was successfully deleted');
           
            this.getProducts();
          },
          error: (err: any) => {
            this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while deleting the product');
          
          }
        });
      }
    });
  }
}
