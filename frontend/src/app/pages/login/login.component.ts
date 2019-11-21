import { Component, OnInit } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';

import { AuthService } from '../../services';
import { getFormFieldError } from '../../lib/utils';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: [ './login.component.scss' ]
})
export class LoginComponent implements OnInit {

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

  onSubmit() {
    this.auth.login(this.form.value.username, this.form.value.password);
  }

  onSignup() {

  }

  getError(field: string) {
    return getFormFieldError(this.form, field);
  }
}
