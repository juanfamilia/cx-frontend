export interface RouteData {
  title: string;
  route: string;
  icon: string;
  roles: number[];
  /** Si true, el ítem solo se muestra con licencia InS (GET /ins/access). */
  requiresIns?: boolean;
  /** Licencia Field (`GET /entitlements/me`). */
  requiresField?: boolean;
  /** Licencia Clever (`GET /entitlements/me`). */
  requiresClever?: boolean;
}
