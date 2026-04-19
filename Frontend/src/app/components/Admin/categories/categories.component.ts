import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { Category } from '../../../interfaces/category';
import { CategoryService } from '../../../services/category.service';
import { MessageService } from '../../../services/message.service';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-categories',
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
  templateUrl: './categories.component.html',
  styleUrl: './categories.component.scss',
  providers: [ConfirmationService]
})
export class CategoriesComponent implements OnInit {


  
  constructor(
    private api: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ){}
  displayDialog = false;
  isEditMode = false;

  NewCategory: Category = {
    id:'',
    name: '',
    parent_id: null
  };



  ngOnInit(): void {
    this.getCategories();
  }

  search = '';
  categories: Category[]=[] ;
  selectedCategory: Category | null= null; 
  //Search név alapján
  get filteredCategories(): Category[] {
    const term = this.search.toLowerCase();

    return this.categories.filter(cat =>
      cat.name.toLowerCase().includes(term)
    );
  }

  //edit/add mentés gomb
  save() {
    if (this.isEditMode) {
      console.log('UPDATE', this.NewCategory);
      this.api.updateCategories(this.NewCategory, this.NewCategory.id!).subscribe({
      next: () => {
        this.messageService.show('success', 'SIKER', 'A kategória sikeresen frissült');
         this.getCategories();
      },
      error: (err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a kategória frissítése közben');
      }
    });
    } else {
      this.api.insertCategories(this.NewCategory).subscribe({
      next: () => {
        this.messageService.show('success', 'SIKER', 'A kategória sikeresen létre lett hozva');
         this.getCategories();
      },
      error: (err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a kategória létrehozása közben');
      }
    });
    }

    this.displayDialog = false;
  }
  //Categória szerkesztése
  edit(cat: Category) {
    this.isEditMode = true;
    this.NewCategory = { ...cat };
    this.displayDialog = true;
  }
  //Categória hozzáadása
  add() {
    this.isEditMode = false;
    this.NewCategory = { id: '', name: '', parent_id: null };
    this.displayDialog = true;
  }
  //Categória törlése
  delete(id: string, name:string) {

    this.confirmationService.confirm({
      message: `Biztosan szeretnéd törölni ezt a kategóriát?|: ${name}`,
      header: 'Megerősítés',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        this.api.deleteCategoriesById(id).subscribe({
          next: () => {
            this.messageService.show('success', 'SIKER', 'The category was successfully deleted');
           
            this.getCategories();
          },
          error: (err: any) => {
            this.messageService.show('error', 'HIBA', err.message?.error || 'An error occurred while deleting the category');
          
          }
        });
      }
    });
  }
  //Categóriák lehívása
  getCategories() {
    this.api.getCategories().subscribe({
      next: (res) => {
        this.categories = res as Category[];
      },
      error: (err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a kategóriák lehívása közben');
      }
    });
  }
}


