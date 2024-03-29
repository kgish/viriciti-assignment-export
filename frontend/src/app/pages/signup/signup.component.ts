import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { AuthService } from '../../services';
import { getFormFieldError } from '../../lib/utils';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: [ './signup.component.scss' ]
})
export class SignupComponent implements OnInit, AfterViewInit {

  @ViewChild('username', { static: false }) username: ElementRef;

  form: FormGroup;

  constructor(private auth: AuthService,
              private fb: FormBuilder) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      username: [ '', [ Validators.required, Validators.minLength(5) ] ],
      password: [ '', [ Validators.required, Validators.minLength(5) ] ]
    });
  }

  ngAfterViewInit(): void {
    // Need to use setTimeout() to avoid ExpressionChangedAfterItHasBeenCheckedError.
    setTimeout(() => {
        // Put focus on the first input field
        this.username.nativeElement.focus();
      }, 200
    );
  }

  onSubmit() {
    const username = this.form.value.username;
    const password = this.form.value.password;
    this.form.reset();
    [ 'username', 'password' ].forEach(f => this.form.controls[f].setErrors(null));
    this.auth.signup(username, password);
  }

  getError(field: string) {
    return getFormFieldError(this.form, field);
  }
}
