import { RouteData } from '../types/routeData';

export const NAVROUTES: RouteData[] = [
  {
    title: 'Dashboard',
    route: '/',
    icon: 'lucideHouse',
    roles: [0, 1, 2, 3],
  },
  {
    title: 'Usuarios',
    route: '/users',
    icon: 'heroUsers',
    roles: [0, 1, 2],
  },
  {
    title: 'Empresas',
    route: '/companies',
    icon: 'lucideBriefcaseBusiness',
    roles: [0],
  },
  {
    title: 'Pagos',
    route: '/payments',
    icon: 'lucideBanknote',
    roles: [0],
  },
  {
    title: 'Areas',
    route: '/work-areas',
    icon: 'lucideMapPinned',
    roles: [1],
  },
  {
    title: 'Formularios',
    route: '/survey-forms',
    icon: 'lucideTextCursorInput',
    roles: [1],
  },
  {
    title: 'Campañas',
    route: '/campaigns',
    icon: 'lucideMegaphone',
    roles: [1, 2],
  },
  {
    title: 'Evaluaciones',
    route: '/evaluations',
    icon: 'lucideFileText',
    roles: [1, 2, 3],
  },
  {
    title: 'Configuración',
    route: '/configuration',
    icon: 'heroCog6Tooth',
    roles: [0, 1, 2, 3],
  },
];
