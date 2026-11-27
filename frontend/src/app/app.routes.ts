
import { Routes } from '@angular/router';
import { AdminPageComponent } from './pages/admin-page.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  // Public login page
  {
    path: 'admin/login',
    component: AdminPageComponent,
    data: { page: 'login' }
  },

  // Protected dashboard and campaign routes
  {
    path: 'admin/forms',
    component: AdminPageComponent,
    canActivate: [authGuard],
    data: { page: 'forms' }
  },
  {
    path: 'admin/forms/new/preview',
    component: AdminPageComponent,
    canActivate: [authGuard],
    data: { page: 'preview' }
  },
  {
    path: 'admin/forms/new',
    component: AdminPageComponent,
    canActivate: [authGuard],
    data: { page: 'builder' }
  },
  {
    path: 'admin/forms/:formId/edit',
    component: AdminPageComponent,
    canActivate: [authGuard],
    data: { page: 'builder' }
  },
  {
    path: 'admin/forms/:formId/preview',
    component: AdminPageComponent,
    canActivate: [authGuard],
    data: { page: 'preview' }
  },
  {
    path: 'admin/analytics',
    component: AdminPageComponent,
    canActivate: [authGuard],
    data: { page: 'analytics' }
  },
  {
    path: 'admin/submissions',
    component: AdminPageComponent,
    canActivate: [authGuard],
    data: { page: 'submissions' }
  },

  // Public campaign form - no Admin login required
  {
    path: 'forms/:brandMarketSlug/:campaignSlug',
    component: AdminPageComponent,
    data: { page: 'public' }
  },

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'admin/forms'
  },
  {
    path: '**',
    redirectTo: 'admin/forms'
  }
];
