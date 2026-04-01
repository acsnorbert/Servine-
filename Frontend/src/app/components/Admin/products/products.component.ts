import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';

@Component({
  selector: 'app-products',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule
  ],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class ProductsComponent {

  search = '';

  products = [
    {
      id: 1,
      name: "Elegance Essence",
      price: 99,
      stock: 25,
      sku: "DRS-001",
      image: ""
    },
    {
      id: 2,
      name: "Strappy With Heels",
      price: 129,
      stock: 3,
      sku: "SH-002",
      image: ""
    },
    {
      id: 3,
      name: "White Ruched Dress",
      price: 139,
      stock: 39,
      sku: "DRS-003",
      image: ""
    }
  ];

  edit(product:any){
    console.log("edit", product);
  }

  delete(id:string){
    console.log("delete", id);
  }
}
