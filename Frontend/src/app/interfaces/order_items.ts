
export interface Order_item {
  id?: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  createdAt?:Date;
  updatedAt?:Date;
  product?:{
    id:string;
    name:string;
    price:number;
    sku:string;
    image_url?: string;

  };
}
