import {AbstractControl} from '@angular/forms';

export class ValidatorService {
  noWhitespaceValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : {whitespace: true};
  }

  dateIsInPastOrToday(control: AbstractControl): { [key: string]: boolean } | null {
    const today: Date = new Date();
    const controlDate: Date = control.value;

    if (controlDate > today) {
      return {dateInPastOrToday: false};
    }

    return null;
  }

  dateIsInFutureOrToday(control: AbstractControl): { [key: string]: boolean } | null {
    const today: Date = new Date();
    today.setHours(0, 0, 0, 0);
    const controlDate: Date = control.value;

    if (controlDate < today) {
      return {dateIsInFutureOrToday: false};
    }

    return null;
  }
}
