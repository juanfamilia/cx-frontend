import { WeeklyProgress } from './weekly-progress';

export interface DashboardSuperAdmin {
  superadmin_id: number;
  total_empresas: number;
  empresas_vigentes: number;
  empresas_caducadas: number;
  usuarios_totales: number;
}

export interface DashboardAdmin {
  company_id: number;
  evaluaciones_aprobadas: number;
  evaluaciones_rechazadas: number;
  evaluadores: number;
  gerentes: number;
}

export interface DashboardManager {
  user_id: number;
  company_id: number;
  zonas_asignadas: number;
  evaluadores_asignados: number;
  active_campaigns: number;
}

export interface DashboardEvaluator {
  sumary: {
    user_id: number;
    enviadas: number;
    actualizadas: number;
    ediciones_pendientes: number;
    aprobadas: number;
    rechazadas: number;
  };
  weekly_progress: WeeklyProgress[];
}
