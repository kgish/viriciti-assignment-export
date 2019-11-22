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

const fn = 'AuthService';

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

    this._init().then(() => console.log(`${ fn } initialized`));
  }

  signin(username: string, password: string): void {
    console.log(`${ fn } signin() username='${ username }' password='*****'`);
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
    console.log(`${ fn } signup() username='${ username }' password='*****'`);
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

  signout(b: boolean = true): void {
    console.log(`${ fn } signout(${ b })`);
    this.user = null;
    this.token.next(null);
    localStorage.removeItem(LOCAL_STORAGE_USERNAME);
    localStorage.removeItem(LOCAL_STORAGE_ACCESS_TOKEN);
    if (b) {
      this.snackbar.open('Signed out successfully', 'X', { duration: 5000 });
    }
    this.router.navigate([ '/signin' ]);
  }

  getUser(): IUser {
    return this.user;
  }

  // Private

  async _init() {
    const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN);
    if (accessToken) {
      this.token.next(accessToken);
      const username = localStorage.getItem(LOCAL_STORAGE_USERNAME) || 'Unknown';
      this.user = { username };
    }

    // // First check and make sure that the backend is up and running
    // if (await this._healthCheck()) {
    //
    //   const accessToken = localStorage.getItem(LOCAL_STORAGE_ACCESS_TOKEN);
    //   this.token.next(accessToken);
    //
    //   // Verify that the token is still valid
    //   if (await this._verifyToken()) {
    //     const username = localStorage.getItem(LOCAL_STORAGE_USERNAME) || 'Unknown';
    //     this.user = { username };
    //   } else {
    //     this.signout(false);
    //   }
    // }
  }

  // async _healthCheck(): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     const url = '/api/health-check';
  //     this.http.get(url).subscribe(
  //       () => {
  //         console.log(`${ fn } _healthCheck() server is available`);
  //         resolve(true);
  //       },
  //       error => {
  //         console.log(`${ fn } _healthCheck() server is unavailable error='${ JSON.stringify(error) }'`);
  //         this.snackbar.open('Server is unavailable, please try again later', 'X', { duration: 5000 });
  //         reject(error);
  //       }
  //     );
  //   });
  // }

  // async _verifyToken(): Promise<boolean> {
  //   return new Promise((resolve, reject) => {
  //     const url = '/api/verify-token';
  //     this.http.get(url).subscribe(
  //       () => {
  //         console.log(`${ fn } _verifyToken() => OK`);
  //         resolve(true);
  //       },
  //       error => {
  //         console.log(`${ fn } _verifyToken() => NOK error='${ JSON.stringify(error) }'`);
  //         reject(error);
  //       }
  //     );
  //   });
  // }
}
