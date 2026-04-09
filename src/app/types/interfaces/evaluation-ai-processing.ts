export type EvaluationAiProcessingStatus =
  | 'pending'
  | 'transcript_only'
  | 'complete';

export interface EvaluationAiProcessing {
  evaluation_id: number;
  transcript_segment_count: number;
  has_analysis: boolean;
  status: EvaluationAiProcessingStatus;
  user_message_es: string;
  hint: string;
}
