# Frontend

## Introduction

The frontend is a responsive web application built using the latest version of Angular and the Matrerial Design CDK.

![Architecture Diagram](../images/screenshot-home-page.png)

## General information

The instructions for the application are very simple.

* Login (first register if you haven't done so already)
* Select vehicle name
* Select a date range
* Hit the submit button
* Results will be listed in the data table.

The vehicle attributes (soc, speed, current, odo and voltage) are listed as checkboxes which can be checked in order to filtrer the results by only
those records containing non-emoty values of that attribute.

Also, a list of radio buttons allow you to generate results per time interval (msec, sec, min, hour, day). This will redisplay the data by average value
over the given time interval. The default view is msec.

There are two tabs displayed: table and chart. The default is table. By selected the chart tab you can view charts of the different attributes based
on the displayed dataset.

Uses the [chartjs](https://www.chartjs.org) library.


## Authorization

The application needs to login first to the backend using JWT authentication. Upon successful authgentication, the token is stored and passed with
each API request in the authentication header.

This is taken care of by the token http interceptor.

interceptors/token.interceptor.ts
```
@Injectable()
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (this.token) {
      request = request.clone({ setHeaders: { Authorization: `Bearer ${this.token}` } });
    }

    return next.handle(request);
  }
```

## Pages

This is a very lightweigth application and only consists of the following (routed) pages.

* Signup
* Signin
* Home

If the application detects that you are not logged in, you will be directed to the signin page.

This is accomplished by the authentication guard.

guards/auth.guard.ts
```
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
    this.router.navigate([ '/signin' ]);
    return false;
  }
}
```

## Proxy

Any http calls starting with /api will be proxied to the backend target.

proxy.conf.json
```
{
 "/api/*": {
    "target": "http://localhost:3000",
    "secure": false,
    "changeOrigin": true,
    "pathRewrite": {
      "^/api": ""
    }
  }
}
```

## Theming

I did my best to implement a pseudo Viriciti (green) house style but admit that it is not perfect. Fortunately, once you know the defined color palettes,
Material Design makes it very easy to implement.


## Export

The user can download a csv document by clicking on the download button.

The file name is formatted as `${vehicle_name}-from_date-to_date.csv`

Uses the [export-to-csv](https://www.npmjs.com/package/export-to-csv) library.

```
onDownload() {
  ...
  document.body.appendChild(textarea);
  ...
  textarea.value = exportToCsv(data, vehicle.name, fromDate, toDate);
  textarea.select();
  document.execCommand('copy');
  document.body.removeChild(textarea);
}
```

For more details, see [lib/utils/export-to-csv.ts](./src/lib/utils/export-to-csv.ts).

## Testing

Run the unit tests.

```
$ npm run test
```

Run the end-to-end tests.

```
$ npm run e2e
```

## References

* [Angular](https://angular.io)
* [JWT](https://jwt.io)
* [Material CDK](https://material.angular.io)
* [TypeScript](https://www.typescriptlang.org)
* [export-to-csv](https://www.npmjs.com/package/export-to-csv)
