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

export class UserClass implements User {
  id!: number;
  role!: number;
  company_id!: number;
  first_name!: string;
  last_name!: string;
  gender!: string;
  email!: string;
  created_at!: string;
  updated_at!: string;
  deleted_at!: string;
  company?: Company;

  constructor(user: User) {
    Object.assign(this, user);
  }

  get fullName(): string {
    return `${this.first_name} ${this.last_name}`;
  }
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

export interface UserOptions {
  id: number;
  full_name: string;
}
