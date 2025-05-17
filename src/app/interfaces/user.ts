import { Company } from './company';

export interface User {
  id: number;
  role: number;
  company_id: number;
  first_name: string;
  last_name: string;
  gender: string;
  email: string;
  country_code: string;
  identity_number: string;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  company?: Company;
}
