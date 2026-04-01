import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    InputTextModule
  ],
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss'
})
export class CategoriesComponent {

  search = '';

  categories = [
    {
      id: 1,
      parent_id: null,
      name: 'Dresses'
    },
    {
      id: 2,
      parent_id: 1,
      name: 'Evening Dresses'
    },
    {
      id: 3,
      parent_id: 1,
      name: 'Summer Dresses'
    },
    {
      id: 4,
      parent_id: null,
      name: 'Shoes'
    }
  ];

  edit(cat: any) {
    console.log('edit', cat);
  }

  delete(id: string) {
    console.log('delete', id);
  }
}