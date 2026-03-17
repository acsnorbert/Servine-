
export interface User {
  user_id?:number;
  name:string;
  email:string;
  password:string;
  phone:string;
  address?:string;
  role:"user" | "admin";
  created_at:Date;
}
