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
  rolechange(id: string,role: string) {
    
    if(this.loggeduserId == id){
      this.messageService.show('warn', 'WARNING', 'you cannot change your own role');
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
            this.messageService.show('success', 'SUCCESS', 'A felhasználó szerepe sikeresen frissült');
           
            this.getUsers();
          },
          error: (err: any) => {
            this.messageService.show('error', 'ERROR', err.message?.error || 'Hiba történt a felhasználó szerepének megváltoztatásakor');
          
          }
    }); 
  }
  delete(id: string,name: string) {
    if(this.loggeduserId == id){
      this.messageService.show('warn', 'WARNING', 'you cannot delete your own account here');
      return;
    }
    this.confirmationService.confirm({
      message: `Are you sure you want to delete this user?|: ${name}`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        
        this.api.DeleteUser(id).subscribe({
          next: () => {
            this.messageService.show('success', 'SUCCESS', 'The User was successfully deleted');
           
            this.getUsers();
          },
          error: (err: any) => {
            this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while deleting the User');
          
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
        this.messageService.show('error', 'ERROR', err.message?.error || 'An error occurred while finding the users');
      }
    })
  }
}
