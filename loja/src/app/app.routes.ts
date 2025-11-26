import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { HomeComponent } from './features/home/home.component';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: '**', redirectTo: '' }
];
