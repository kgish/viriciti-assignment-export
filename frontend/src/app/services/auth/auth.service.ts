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
  }

  signin(username: string, password: string): void {
    const url = '/api/auth/signin';
    this.http
      .post(url, { username, password }).subscribe((data: ISigninRO) => {
        this.user = { username };
        this.token.next(data.accessToken);
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
          this.snackbar.open(`Oops, unexpected error (${statusCode} ${message})`, 'X', { duration: 5000 });
        }
      });
  }

  signout(): void {
    this.user = null;
    this.token.next(null);
    this.snackbar.open('Signed out successfully', 'X', { duration: 5000 });
    this.router.navigate([ '/signin' ]);
  }

  getUser(): IUser {
    return this.user;
  }
}
