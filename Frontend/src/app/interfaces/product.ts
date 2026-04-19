export interface Product {
  id?: string;
  category_id: string;
  name: string;
  description?: string;
  price: number;
  stock: number;
  sku: string;
  image: string;
  createdAt?: Date;
  updatedAt?:Date;
  category?: {
    id: string;
    parent_id: string | null;
    name: string;
  };
}