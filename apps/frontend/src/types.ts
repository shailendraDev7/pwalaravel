// src/types.ts
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface ExtendedUser extends SupabaseUser {
  [key: string]: unknown; // Use 'unknown' for additional properties, requiring type narrowing
}

export interface Order {
  id: string;
  total: number;
  status: string;
  order_details: {
    id: string;
    product_id: string;
    quantity: number;
    price: number;
    address: string;
    product: {
      name: string;
      product_img: string;
    };
  }[];
}