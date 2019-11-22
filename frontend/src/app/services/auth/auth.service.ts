import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

interface ISigninRO {
  user: {
    name: string;
  };
  accessToken: string;
}

export interface IUser {
  username: string;
}

const LOCAL_STORAGE_ACCESS_TOKEN = 'viriciti-access-token';
const LOCAL_STORAGE_USERNAME = 'viriciti-user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  token = new BehaviorSubject<string>(null);
  user: IUser;

  constructor(private router: Router,
              private snackbar: MatSnackBar,
              private dialog: MatDialog,
              private http: HttpClient) {

    const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN);
    if (accessToken) {
      this.token.next(accessToken);
      const username = localStorage.getItem(LOCAL_STORAGE_USERNAME) || 'Unknown';
      this.user = { username };
    }
  }

  signin(username: string, password: string): void {
    const url = '/api/auth/signin';
    this.http
      .post(url, { username, password }).subscribe((data: ISigninRO) => {
        this.user = { username };
        this.token.next(data.accessToken);
        localStorage.setItem(LOCAL_STORAGE_USERNAME, username);
        localStorage.setItem(LOCAL_STORAGE_ACCESS_TOKEN, data.accessToken);
        this.snackbar.open('Signed in successfully', 'X', { duration: 5000 });
        this.router.navigate([ '/' ]);
      },
      error => {
        console.error(error);
        this.snackbar.open('Invalid credentials, please try again.', 'X', { duration: 5000 });
      });
  }

  signup(username: string, password: string): void {
    const url = '/api/auth/signup';
    this.http
      .post(url, { username, password }).subscribe(() => {
        this.snackbar.open('Signed up successfully, please login.', 'X', { duration: 5000 });
        this.router.navigate([ '/signin' ]);
      },
      error => {
        console.error(error);
        const statusCode = error.statusCode;
        const message = error.error;
        if (JSON.stringify(error).match(/password too weak/)) {
          this.snackbar.open('Password is too weak, please try again.', 'X', { duration: 5000 });
        } else {
          this.snackbar.open(`Oops, unexpected error (${ statusCode } ${ message })`, 'X', { duration: 5000 });
        }
      });
  }

  signout(): void {
    this.user = null;
    this.token.next(null);
    localStorage.removeItem(LOCAL_STORAGE_USERNAME);
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    this.snackbar.open('Signed out successfully', 'X', { duration: 5000 });
    this.router.navigate([ '/signin' ]);
  }

  getUser(): IUser {
    return this.user;
  }
}
