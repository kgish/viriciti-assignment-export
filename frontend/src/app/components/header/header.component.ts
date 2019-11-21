import { Component, Input, OnInit, OnDestroy } from '@angular/core';

import {
  AuthService,
  IUser
} from '../../services';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ]
})
export class HeaderComponent implements OnInit, OnDestroy {

  @Input() title: string;

  loggedIn: boolean;
  user: IUser;

  subscription: Subscription;

  constructor(public auth: AuthService) {
    this.subscription = auth.token.subscribe(token => {
      this.loggedIn = !!token;
      this.user = auth.getUser();
    });
  }

  ngOnInit() {
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  triggerToggleSidenav() {
  }

  signout() {
    this.auth.signout();
  }
}
