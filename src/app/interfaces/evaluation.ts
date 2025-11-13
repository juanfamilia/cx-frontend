import { Pagination } from '../types/pagination';
import { Campaign } from './campaign';
import { SurveyFormAspect } from './survey-form';
import { UserClass } from './user';
import { Video } from './video';

export interface Evaluation {
  id: number;
  campaigns_id: number;
  video_id: number;
  user_id: number;
  location: string;
  evaluated_collaborator: string;
  status: string;
  video: Video;
  campaign: Campaign;
  user: UserClass;
  evaluation_answers: EvaluationAnswer[];
  visited_zones: string[];
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface EvaluationList {
  data: Evaluation[];
  pagination: Pagination;
}

export interface EvaluationCreate {
  video: string;
  location: string;
  evaluated_collaborator: string;
  evaluation_answers: EvaluationAnswerCreate[];
}

export interface EvaluationAnswer {
  id: number;
  evaluation_id: number;
  aspect_id: number;
  value_number: number | null;
  value_boolean: boolean | null;
  comment: string;
  aspect: SurveyFormAspect | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}

export interface EvaluationAnswerCreate {
  aspect_id: number;
  value_number?: number;
  value_boolean?: boolean;
  comment?: string;
}
