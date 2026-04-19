
export interface User {
  id?:string;
  name?:string;
  email:string;
  password:string;
  confirm?: string;
  phone?:string;
  address?:string;
  role?:"user" | "admin";
  createdAt?:Date;
  updatedAt?:Date;
}
