import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { UserService } from '../../../services/user.service';
import { MessageService } from '../../../services/message.service';
import { User } from '../../../interfaces/user';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-users',
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
  templateUrl: './users.component.html',
  styleUrl: './users.component.scss',
  providers: [ConfirmationService]
})
export class UsersComponent implements OnInit {

  constructor(
    private api: UserService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private auth: AuthService
  ){}
  users:User[]=[];
  loggeduserId:any
  data:any
  ngOnInit(): void {
    this.loggeduserId = this.auth.currentUser()?.id
    this.getUsers()
    
  }
  search = '';
  get filteredUsers(): User[] {
        const term = this.search.toLowerCase();
    
        return this.users.filter(x =>
          x.email.toLowerCase().includes(term)
        );
      }
    
  rolechange(id: string,role: string) {
    
    if(this.loggeduserId == id){
      this.messageService.show('warn', 'FIGYELEM', 'A saját szerepedet nem tudod állítani');
      return;
    }
    if(role == "user"){
      role = "admin"
    }
    else if(role== "admin"){
      role = "user"
    }
    this.data ={
      role
    }
    this.api.ChangeUserRole(id, this.data).subscribe({
          next: () => {
            this.messageService.show('success', 'SIKER', 'A felhasználó szerepe sikeresen frissült');
           
            this.getUsers();
          },
          error: (err: any) => {
            this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a felhasználó szerepének megváltoztatásakor');
          
          }
    }); 
  }
  delete(id: string,name: string) {
    if(this.loggeduserId == id){
      this.messageService.show('warn', 'FIGYELEM', 'A saját fiókodat nem tudod törölni');
      return;
    }
    this.confirmationService.confirm({
      message: `Biztosan ki szeretnéd törölni ezt a felhasználót?|: ${name}`,
      header: 'Megerősítés',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        this.api.DeleteUser(id).subscribe({
          next: () => {
            this.messageService.show('success', 'SIKER', 'A felhasználó sikeresen törölve lett');
           
            this.getUsers();
          },
          error: (err: any) => {
            this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a felhasználó törlése közben');
          
          }
        });
      }
    });
  }

  getUsers(){
    this.api.GetUsers().subscribe({
      next: (res)=>{
        this.users = res as User[];
        
      },
      error: (err)=>{
        this.messageService.show('error', 'HIBA', err.message?.error || 'Hiba történt a felhasználók lehívásakor');
      }
    })
  }
}
