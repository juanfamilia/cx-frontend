import { Pagination } from '../types/pagination';
import { Campaign } from './campaign';
import { UserClass } from './user';

export interface CampaignGoalsEvaluator {
  id: number;
  evaluator_id: number;
  campaign_id: number;
  goal: number;
  created_at: string;
  updated_at: string;
  deleted_at: string;
  evaluator: UserClass;
  campaign: Campaign;
}

export interface CampaignGoalsEvaluatorCreate {
  evaluator_id: number;
  campaign_id: number;
  goal: number;
}

export interface CampaignGoalsEvaluatorUpdate {
  goal?: number;
}

export interface CampaignGoalsEvaluatorList {
  data: CampaignGoalsEvaluator[];
  pagination: Pagination;
}
