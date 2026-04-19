
export interface Order {
  id?: string;
  user_id:string;
  order_date: string;
  status: string;
  total_price: number;
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
