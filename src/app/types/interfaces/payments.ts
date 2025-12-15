import { Pagination } from '../types/pagination';
import { Company } from './company';

export interface Payment {
  id: number;
  company_id: number;
  amount: number;
  date: string;
  description: string;
  valid_before: string;
  company?: Company;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface PaymentCreate {
  company_id: number;
  amount: number;
  date: string;
  description: string;
  valid_before: string;
}

export interface PaymentList {
  data: Payment[];
  pagination: Pagination;
}
