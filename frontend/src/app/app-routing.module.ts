import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

// --- PAGES --- //
import {
  HomeComponent,
  LoginComponent,
  SignupComponent
} from './pages';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignupComponent },
  { path: '**', component: HomeComponent }
];

@NgModule({
  imports: [ RouterModule.forRoot(routes) ],
  exports: [ RouterModule ]
})
export class AppRoutingModule {
}
