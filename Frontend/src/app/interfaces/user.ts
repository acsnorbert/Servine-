
export interface User {
  user_id?:string;
  name?:string;
  email:string;
  password:string;
  confirm?: string;
  phone?:string;
  address?:string;
  role?:"user" | "admin";
  created_at?:Date;
}
