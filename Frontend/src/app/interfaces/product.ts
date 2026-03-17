
export interface Product {
  product_id?:number;
  category_id:number;
  name:string;
  description?:string;
  price:number;
  stock:number;
  sku:string;
  image:string;
  created_at:Date;
}
