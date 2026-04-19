export interface Category {
  id?: string;
  parent_id: string | null;
  name: string;
  createdAt?:Date;
  updatedAt?:Date;
}

