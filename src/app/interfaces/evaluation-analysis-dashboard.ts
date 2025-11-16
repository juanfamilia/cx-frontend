/* eslint-disable @typescript-eslint/no-explicit-any */
export interface EvaluationAnalysisDashboard {
  campaign_id: number;
  campaign_name: string;
  operative_views: string[]; // luego lo parsearemos
  company_id: number;
}

export interface AnalysisData {
  campaign_name: string;
  operative_views: IA[];
}

export interface IA {
  id_entrevista: string;
  timestamp_analisis: Date;
  metadata: Metadata;
  IOC: CES;
  IRD: CES;
  CES: CES;
  Calidad: Calidad;
  Verbatims: Verbatims;
  acciones_sugeridas: string[];
}

export interface CES {
  score: number;
  justificacion: string;
}

export interface Calidad {
  saludo: boolean;
  identificacion: boolean;
  ofrecimiento: boolean;
  cierre: boolean;
  valor_agregado: boolean;
}

export interface Verbatims {
  positivos: any[];
  negativos: any[];
  criticos: Critico[];
}

export interface Critico {
  texto: string;
  origen: string;
  timestamp: string;
}

export interface Metadata {
  canal: string;
  duracion_segundos: number;
  pais: string;
  sucursal_id: string;
  segmento_cliente: string;
}
