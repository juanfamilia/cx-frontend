import { Evaluation } from './evaluation';
import { User } from './user';

export interface Notification {
  id: number;
  user_id: number;
  evaluation_id: number;
  status: string;
  read: boolean;
  comment: string;
  user: User;
  evaluation: Evaluation;
  created_at: string;
  updated_at: string;
  deleted_at: string;
}
