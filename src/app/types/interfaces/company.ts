import { Pagination } from '../pagination';

export interface Company {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  country: string;
  /** Industria sectorial (template de competencias). Solo superadmin asigna al crear/editar. */
  industry_id?: number | null;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface CompanyCreate {
  name: string;
  phone: string;
  email: string;
  address: string;
  state: string;
  country: string;
  industry_id?: number | null;
}

export interface CompanyList {
  data: Company[];
  pagination: Pagination;
}
