import { Pagination } from '../pagination';

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

export type AspectType = 'number' | 'boolean' | 'likert' | 'compliance' | 'media';

export interface SurveyFormSectionCreate {
  name: string;
  maximum_score: number;
  order: number;
  weight: number | null;
  aspects: SurveyFormAspectCreate[];
}

export interface SurveyFormAspectCreate {
  description: string;
  type: AspectType;
  maximum_score: number | null;
  order: number;
  weight: number | null;
  requires_evidence: boolean;
}

export interface SurveyFormSection {
  id: number;
  name: string;
  maximum_score: number;
  order: number;
  weight: number | null;
  aspects: SurveyFormAspect[];
}

export interface SurveyFormAspect {
  id: number;
  description: string;
  type: AspectType;
  maximum_score: number | null;
  order: number;
  weight: number | null;
  requires_evidence: boolean;
}

export interface SurveyFormDetail extends SurveyForm {
  sections: SurveyFormSection[];
}

export interface SurveyFormList {
  data: SurveyForm[];
  pagination: Pagination;
}
