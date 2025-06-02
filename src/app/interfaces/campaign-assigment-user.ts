import { Pagination } from '../types/pagination';
import { Campaign } from './campaign';
import { UserClass } from './user';

export interface CampaignAssignmentUser {
  id: number;
  campaign_id: number;
  user_id: number;
  campaign?: Campaign;
  user?: UserClass;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface CampaignAssignmentUserCreate {
  campaign_id: number;
  user_ids: number[];
}

export interface CampaignAssignmentUserList {
  data: CampaignAssignmentUser[];
  pagination: Pagination;
}
