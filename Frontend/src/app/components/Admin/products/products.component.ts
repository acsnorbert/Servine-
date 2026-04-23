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
import { UploadService } from '../../../services/upload.service';
import { environment } from '../../../enviroments/environment';


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
    private imgApi: UploadService,
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
  ImageFile?: File | null = null;
  imagePreview: string | null = null;
  serverUrl = environment.serverUrl
  

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
   //Kép műveletek------------------------------------------------------------------------------
  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    if (file) {
      this.ImageFile = file;

      this.imagePreview = URL.createObjectURL(file);
    }
  }
  getImageUrl(path: string) {
    return path;
  }
  resetDialog(){
    this.newProduct = {
    category_id: '',
    name: '',
    price: 0,
    stock: 0,
    sku: '',
    image: ''
  };

  this.ImageFile = null;
  this.imagePreview = null;
  this.isEditMode = false;
  }
  //Adatok lekérése---------------------------------------------------------------------
  generateSku(): string {
    const random = Math.floor(10000 + Math.random() * 90000); 
    return `SKU-${random}`;
  }

  getProducts(){
    this.api.getProducts().subscribe({
      next: (res)=>{
        this.products = res as Product[];
      },
      error: (err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a termékek lehívása közben');
      }

    })
  }
  getCategories() {
    this.catApi.getCategories().subscribe({
      next: (res) => {
        this.categories = res as Category[];
      },
      error: (err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a kategóriák lehívása közben');
      }
    });
  }
  //Adatok műveletei-----------------------------------------------------------------
  edit(product:any){
    this.isEditMode = true;
    this.newProduct = { ...product };
    this.imagePreview = null;
    this.displayDialog = true;
  }
  add() {
    this.isEditMode = false;
    this.imagePreview = null;
    this.newProduct = {
      id:'',
      category_id: '',
      name: '',
      price: 0,
      stock: 0,
      sku: this.generateSku(),
      image: '' };
    this.displayDialog = true;
    }
  save() {
  if (this.ImageFile) {
    const filename = this.newProduct.image?.split('/').pop();
    this.imgApi.deleteImage(filename!).subscribe({
      error:(err)=>{
        this.messageService.show('error', 'HIBA', 'Nem sikerült a képet törölni');
      }
    })
    this.imgApi.uploadImage(this.ImageFile).subscribe({
      next: (res) => {
        this.newProduct.image = res.path;
        console.log(res.path)
        this.saveProduct(); 
      },
      error: (err) => {
        this.messageService.show('error', 'HIBA', 'Kép feltöltési hiba');
      }
    });
  } else {
    this.saveProduct(); 
  }
}

private saveProduct() {
  if (this.isEditMode) {
    this.api.updateProduct(this.newProduct, this.newProduct.id!).subscribe({
      next: () => {
        this.messageService.show('success', 'SIKER', 'Frissítve');
        this.getProducts();
      }
    });
  } else {
    this.api.insertProduct(this.newProduct).subscribe({
      next: () => {
        this.messageService.show('success', 'SIKER', 'Létrehozva');
        this.getProducts();
      }
    });
  }

  this.displayDialog = false;
}

  delete(product:Product){
    this.confirmationService.confirm({
      message: `Biztosan ki szeretnéd törölni ezt a terméket?|: ${product.name}`,
      header: 'Megerősítés',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const filename = product.image?.split('/').pop();

         this.imgApi.deleteImage(filename!).subscribe({
            error:(err)=>{
              this.messageService.show('error', 'HIBA', 'Nem sikerült a képet törölni');
            }
          })
        
        this.api.deleteProductById(product.id!).subscribe({
          next: () => {
            
            this.messageService.show('success', 'SIKER', 'A termék sikeresen törölve lett');
           
            this.getProducts();
          },
          error: (err: any) => {
            this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a termék törlése közben');
          
          }
        });
      }
    });
  }
}
