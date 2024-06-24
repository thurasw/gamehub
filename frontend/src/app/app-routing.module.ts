import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin/admin.component';
import { AuthGuard } from './auth/auth.guard';
import { EmailComponent } from './auth/reset-pw/email/email.component';
import { ResetComponent } from './auth/reset-pw/reset/reset.component';
import { SigninComponent } from './auth/signin/signin.component';
import { SignupComponent } from './auth/signup/signup.component';
import { VerifyComponent } from './auth/verify/verify.component';

import { DashboardComponent } from './dashboard/dashboard.component';
import { GameDetailsComponent } from './game/game-details/game-details.component';
import { SearchComponent } from './search/search.component';

const routes: Routes = [
  {path: '', pathMatch: 'full', component: DashboardComponent},
  {path: 'signin', component: SigninComponent, canActivate: [AuthGuard], data: {permission: "unregistered"}},
  {path: 'signup', component: SignupComponent, canActivate: [AuthGuard], data: {permission: "unregistered"}},
  {path: 'verify', component: VerifyComponent, canActivate: [AuthGuard], data: {permission: "unregistered"}},
  {path: 'reset-pw/email', component: EmailComponent, canActivate: [AuthGuard], data: {permission: "unregistered"}},
  {path: 'reset-pw/reset', component: ResetComponent, canActivate: [AuthGuard], data: {permission: "unregistered"}},
  {path: 'search', component: SearchComponent},
  {path: 'admin', component: AdminComponent, canActivate: [AuthGuard], data: {permission: "admin"}},
  {path: 'game/:slug', component: GameDetailsComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {scrollPositionRestoration: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
