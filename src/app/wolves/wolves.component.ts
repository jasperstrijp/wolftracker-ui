import {Component, OnInit} from '@angular/core';
import {WolfService} from '../services/wolf.service';
import {Wolf} from '../models/wolf';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Gender} from '../models/gender.enum';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ValidatorService} from '../services/validator.service';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-wolves',
  templateUrl: './wolves.component.html',
  styleUrls: ['./wolves.component.scss'],
  providers: [WolfService, HttpClient, ValidatorService]
})
export class WolvesComponent implements OnInit {
  wolvesLoading = true;
  updatingWolf = true;

  genderValues = [];
  wolves: Wolf[] = [];
  WolvesTableColumns = ['name', 'gender', 'updatedAt', 'actions'];

  selectedWolf: Wolf = null;
  selectedWolfId: number;
  selectedWolfBirthday: FormControl = null;

  updateWolfForm: FormGroup;


  private wolfService: WolfService;
  private validatorService: ValidatorService;
  private snackbar: MatSnackBar;

  constructor(wolfService: WolfService, validatorService: ValidatorService, snackbar: MatSnackBar) {
    this.snackbar = snackbar;
    this.wolfService = wolfService;
    this.validatorService = validatorService;
    this.genderValues = Object.keys(Gender).filter(f => isNaN(Number(f)));

    this.updateWolfForm = new FormGroup({
      name: new FormControl('', [Validators.required, validatorService.noWhitespaceValidator]),
      gender: new FormControl('', [Validators.required]),
      birthday: new FormControl('', [Validators.required, validatorService.dateIsInPastOrToday])
    });
  }

  ngOnInit(): void {
    this.getAllWolves();
  }

  getAllWolves(): void {
    this.wolfService.getWolves().subscribe((wolves: Wolf[]) => {
      this.wolves = wolves.sort((a, b) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });

      this.wolvesLoading = false;
    });
  }

  addWolf(): void {

  }

  updateWolf(id: number): void{
    this.updatingWolf = true;

    if (!this.updateWolfForm.valid){
      return;
    }

    // Load form data
    const wolfToUpdate = this.getWolfFromArray(id);
    wolfToUpdate.name = this.updateWolfForm.controls.name.value;
    wolfToUpdate.gender = this.updateWolfForm.controls.gender.value;
    wolfToUpdate.birthday = this.updateWolfForm.controls.birthday.value;

    // Send update request to the API
    this.wolfService.updateWolf(wolfToUpdate).subscribe(() => {
      // Update was successful
      this.snackbar.open('Successfully updated', 'close', {duration: 1500});
      this.updatingWolf = false;

      // Reload data on the page
      this.getAllWolves();
      this.updateSelectedWolf();

      this.updatingWolf = false;
    }, (error: HttpErrorResponse) => {
      // Update Failed
      this.snackbar.open(error.error, 'close', {
        duration: 5000
      });
    });
  }

  updateSelectedWolf(): void {
    this.wolfService.getWolfById(this.selectedWolf.id).subscribe(wolf => {
      this.selectedWolf = wolf;
      this.updateWolfUpdateForm();
    });
  }

  updateWolfUpdateForm(): void {
    this.updateWolfForm.controls.name.setValue(this.selectedWolf.name);
    this.updateWolfForm.controls.gender.setValue(this.selectedWolf.gender);
    this.updateWolfForm.controls.birthday.setValue(this.selectedWolf.birthday);
  }

  selectWolf(id: number): void {
    this.selectedWolf = this.getWolfFromArray(id);
    this.updateWolfUpdateForm();
  }

  getWolfFromArray(id: number): Wolf{
    if (this.wolves === null || this.wolves.length === 0){
      return null;
    }

    return this.wolves.find((wolf => wolf.id === id));
  }

  capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  closeSelectedWolf(): void {
    this.selectedWolf = null;
  }
}
