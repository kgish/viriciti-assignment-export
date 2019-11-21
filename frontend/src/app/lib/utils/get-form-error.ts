import { FormGroup } from '@angular/forms';

export function getFormFieldError(form: FormGroup, field: string): string {
  let result = '';
  if (form && form.controls && form.controls[ field ]) {
    const errors = form.controls[ field ].errors;
    if (errors) {
      if (errors.email) {
        result = 'Must be a valid email';
      } else if (errors.required) {
        result = 'Required';
      } else if (errors.minlength) {
        result = `Minimum length is ${errors.minlength.requiredLength} `;
      } else {
        result = JSON.stringify(errors);
      }
    }
  }
  return result;
}
