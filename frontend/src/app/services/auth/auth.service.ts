import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { MatDialog, MatSnackBar } from '@angular/material';
import { BehaviorSubject } from 'rxjs';

interface ILoginRO {
  user: {
    name: string;
  };
  token: string;
}

export interface IUser {
  name: string;
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

  login(username: string, password: string): void {
    const url = 'http://localhost:3000/api/v1/login';
    this.http
      .post(url, { username, password }).subscribe((data: ILoginRO) => {
        // console.log(data);
        this.user = data.user;
        this.token.next(data.token);
        this.snackbar.open('Login successful', 'X', { duration: 5000 });
        this.router.navigate([ '/' ]);
      },
      error => {
        console.error(error);
        this.snackbar.open('Invalid credential, please try again.', 'X', { duration: 5000 });
      });
  }

  logout(): void {
    this.user = null;
    this.token.next(null);
    this.snackbar.open('Logout successful', 'X', { duration: 5000 });
    this.router.navigate([ '/login' ]);
  }

  getUser(): IUser {
    return this.user;
  }
}
