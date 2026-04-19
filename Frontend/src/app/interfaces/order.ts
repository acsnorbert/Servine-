
export interface Order {
  id?: string;
  user_id:string;
  order_date: string;
  status: string;
  total_price: number;
  createdAt?:Date;
  updatedAt?:Date;
  user?:{
    name:string;
    email:string;
  }//Order items
  items?:{
    name:string;
    quantity: number;
    price: number;
  }
}
