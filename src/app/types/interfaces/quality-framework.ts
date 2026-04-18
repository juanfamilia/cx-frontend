import { Pagination } from '../pagination';

export interface Industry {
  id: number;
  code: string;
  name: string;
  description: string | null;
  icon: string | null;
  is_active: boolean;
  created_at: string | null;
  updated_at: string | null;
}

export interface IndustriesPublic {
  data: Industry[];
  pagination: Pagination;
}

export interface SuggestedSurveyAspectItem {
  competency_id: number;
  competency_code: string;
  name: string;
  suggested_description: string;
  suggested_type: string;
  suggested_order: number;
  weight_hint: number;
  is_mandatory: boolean;
}

export interface SuggestedSurveyAspectsResponse {
  company_id: number;
  industry_id: number | null;
  items: SuggestedSurveyAspectItem[];
}

export interface CompanyCompetencyConfig {
  id: number;
  company_id: number;
  competency_id: number;
  is_enabled: boolean;
  custom_weight: number | null;
  custom_notes: string | null;
  created_by_user_id: number | null;
  created_at: string | null;
  updated_at: string | null;
}
