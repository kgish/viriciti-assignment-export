import { Component, Input, OnInit } from '@angular/core';

import {
  AuthService,
  IUser
} from '../../services';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: [ './header.component.scss' ]
})
export class HeaderComponent implements OnInit {

  @Input() title: string;

  loggedIn: boolean;
  user: IUser;

  constructor(public auth: AuthService) {
    auth.token.subscribe(token => {
      this.loggedIn = !!token;
      this.user = auth.getUser();
    });
  }

  ngOnInit() {
  }

  triggerToggleSidenav() {
  }

  signout() {
    this.auth.signout();
  }
}
