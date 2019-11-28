import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// --- PAGES --- //
import {
  HomeComponent,
  SigninComponent,
  SignupComponent
} from './pages';

import { AuthGuard } from './guards';

const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [AuthGuard] },
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  {path: '**', redirectTo: '', pathMatch: 'full'}
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
