export interface EvaluationAnalysis {
  id: number;
  evaluation_id: number;
  analysis: string;
  executive_view: string;
  operative_view: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string;
}
