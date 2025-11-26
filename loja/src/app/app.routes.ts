import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';
import { AdminShellComponent } from './features/admin/admin-shell.component';
import { AdminDashboardComponent } from './features/admin/admin-dashboard.component';
import { AdminEstoqueComponent } from './features/admin/admin-estoque.component';
import { AdminUsuariosComponent } from './features/admin/admin-usuarios.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  {
    path: 'admin',
    component: AdminShellComponent,
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'painel', pathMatch: 'full' },
      { path: 'painel', component: AdminDashboardComponent },
      { path: 'estoque', component: AdminEstoqueComponent },
      { path: 'cadastrar-admin', component: AdminUsuariosComponent }
    ]
  },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
