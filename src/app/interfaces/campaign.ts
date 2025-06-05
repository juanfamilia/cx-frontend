import { Pagination } from '../types/pagination';
import { CampaignAssignmentUser } from './campaign-assigment-user';
import { CampaignAssignmentZone } from './campaign-assignment-zone';
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

export interface CampaignAssignments {
  by_user: CampaignAssignmentUser[];
  by_zone: CampaignAssignmentZone[];
}
