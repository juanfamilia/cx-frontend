import { Pagination } from '../types/pagination';
import { SurveyFormDetail } from './survey-form';

export interface Campaign {
  id: number;
  company_id: number;
  name: string;
  objective: string;
  date_start: string;
  date_end: string;
  channel: string;
  survey_id: number;
  notes: string;
  survey?: SurveyFormDetail;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface CampaignCreate {
  name: string;
  objective: string;
  date_start: string;
  date_end: string;
  channel: string;
  survey_id: number;
  notes: string;
}

export interface CampaignList {
  data: Campaign[];
  pagination: Pagination;
}
