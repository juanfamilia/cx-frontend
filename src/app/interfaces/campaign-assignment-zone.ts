import { Pagination } from '../types/pagination';
import { Campaign } from './campaign';
import { Zone } from './zone';

export interface CampaignAssignmentZone {
  id: number;
  campaign_id: number;
  zone_id: number;
  campaign?: Campaign;
  zone?: Zone;
}

export interface CampaignAssignmentZoneCreate {
  campaign_id: number;
  zone_ids: number[];
}

export interface CampaignAssignmentZoneList {
  data: CampaignAssignmentZone[];
  pagination: Pagination;
}
