import { Routes } from '@angular/router';
import { authGuard } from '@core/guards/auth.guard';
import { IntelligenceComponent } from './intelligence.component';

export const intelligenceRoutes: Routes = [
  {
    path: '',
    component: IntelligenceComponent,
    canActivate: [authGuard],
    data: { role: [0, 1, 2], title: 'Intelligence Dashboard' },
  },
];
