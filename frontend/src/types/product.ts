export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string | null;
  category: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ProductInput {
  sku: string;
  name: string;
  brand?: string;
  category?: string;
}
