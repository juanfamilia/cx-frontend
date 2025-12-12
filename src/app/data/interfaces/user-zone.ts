import { Pagination } from '../types/pagination';
import { User } from './user';
import { Zone } from './zone';

export interface UserZone {
  id: number;
  user_id: number;
  zone_id: number;
  user?: User;
  zone?: Zone;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}

export interface UserZoneCreate {
  user_id: number;
  zone_ids: number[];
}

export interface UserZoneList {
  data: UserZone[];
  pagination: Pagination;
}
