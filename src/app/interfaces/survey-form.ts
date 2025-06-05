import { Pagination } from '../types/pagination';

export interface SurveyForm {
  id: number;
  title: string;
  company_id: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface SurveyFormCreate {
  title: string;
  sections: SurveyFormSectionCreate[];
}

export interface SurveyFormSectionCreate {
  name: string;
  maximum_score: number;
  order: number;
  aspects: SurveyFormAspectCreate[];
}

export interface SurveyFormAspectCreate {
  description: string;
  type: string;
  maximum_score: number;
  order: number;
}

export interface SurveyFormSection {
  id: number;
  name: string;
  maximum_score: number;
  order: number;
  aspects: SurveyFormAspect[];
}

export interface SurveyFormAspect {
  id: number;
  description: string;
  type: string;
  maximum_score: number;
  order: number;
}

export interface SurveyFormDetail extends SurveyForm {
  sections: SurveyFormSection[];
}

export interface SurveyFormList {
  data: SurveyForm[];
  pagination: Pagination;
}
