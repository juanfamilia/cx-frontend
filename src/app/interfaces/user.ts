import { Pagination } from '../types/pagination';
import { Company } from './company';

export interface User {
  id: number;
  role: number;
  company_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  company?: Company;
}

export interface UserCreate {
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  password: string;
  company_id: number;
  role: number;
}

export interface UserList {
  data: User[];
  pagination: Pagination;
}
