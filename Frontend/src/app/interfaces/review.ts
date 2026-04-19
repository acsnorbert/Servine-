
export interface Review {
  review_id?:string;
  product_id:string;
  user_id:string;
  rating:number;
  comment?:string;
  createdAt?:Date;
  updatedAt?:Date;
}
