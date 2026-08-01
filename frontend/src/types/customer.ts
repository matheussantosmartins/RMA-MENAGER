export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerInput {
  name: string;
  email: string;
  phone?: string;
  address?: string;
}
