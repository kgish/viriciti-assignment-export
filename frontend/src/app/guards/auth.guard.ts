import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';

import { AuthService } from '../services';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  loggedIn: boolean;

  constructor(private auth: AuthService, private router: Router) {
    auth.token.subscribe(token => this.loggedIn = !!token);
  }

  canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (this.loggedIn) {
      return true;
    }
    this.router.navigate([ '/login' ]);
    return false;
  }
}
