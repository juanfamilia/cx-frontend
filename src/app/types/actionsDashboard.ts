export interface ActionDashboard {
  title: string;
  icon: string;
  route: string;
  /** Destaca la acción principal del rol (estilo primario). */
  variant?: 'primary' | 'default';
}
