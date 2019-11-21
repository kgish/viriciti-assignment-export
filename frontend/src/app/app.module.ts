import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { ReactiveFormsModule } from '@angular/forms';
import { FlexLayoutModule } from '@angular/flex-layout';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

// --- MODULES --- //
import {
  MaterialModule
} from './modules';

// --- COMPONENTS -- ///
import {
  FooterComponent,
  HeaderComponent
} from './components';

// --- PAGES --- //
import {
  HomeComponent,
  LoginComponent,
  SignupComponent
} from './pages';

// --- PIPES --- //
import {
  FormatDatePipe
} from './pipes';

// --- INTERCEPTORS --- //
import {
  TokenInterceptor
} from './interceptors';

@NgModule({
  declarations: [
    AppComponent,
    FooterComponent,
    FormatDatePipe,
    HeaderComponent,
    HomeComponent,
    LoginComponent,
    SignupComponent
  ],
  imports: [
    AppRoutingModule,
    BrowserAnimationsModule,
    BrowserModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    HttpClientModule,
    MaterialModule
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true}
  ],
  bootstrap: [ AppComponent ]
})
export class AppModule {
}
