import {AbstractControl} from '@angular/forms';

export class ValidatorService {
  noWhitespaceValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const isWhitespace = (control.value || '').trim().length === 0;
    return !isWhitespace ? null : {whitespace: true};
  }

  onlyLettersValidator(control: AbstractControl): {[key: string]: boolean} | null {
    return !/^[a-zA-Z]*$/g.test(control.value) ? {onlyLetters: true} : null;
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
