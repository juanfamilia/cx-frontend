import { RouteData } from '@data/types/routeData';

export const NAVROUTES: RouteData[] = [
  {
    title: 'Dashboard',
    route: '/',
    icon: 'lucideHouse',
    roles: [0, 1, 2, 3],
  },
  {
    title: 'Dashboard Ejecutivo',
    route: '/executive-dashboard',
    icon: 'lucideChartArea',
    roles: [0, 1],
  },
  {
    title: 'Búsqueda',
    route: '/transcript-search',
    icon: 'lucideSearch',
    roles: [0, 1, 2],
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
    title: 'Prompts',
    route: '/prompts',
    icon: 'lucideSparkles',
    roles: [0, 1],
  },
  {
    title: 'Intelligence',
    route: '/intelligence',
    icon: 'lucideBrain',
    roles: [0, 1, 2],
  },
  {
    title: 'Configuración',
    route: '/configuration',
    icon: 'heroCog6Tooth',
    roles: [0, 1, 2, 3],
  },
];
