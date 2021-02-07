import {Component, OnInit} from '@angular/core';
import {WolfService} from '../services/wolf.service';
import {Wolf} from '../models/wolf';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {Gender} from '../models/gender.enum';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ValidatorService} from '../services/validator.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {ActivatedRoute} from '@angular/router';
import {switchMap} from 'rxjs/operators';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Component({
  selector: 'app-wolves',
  templateUrl: './wolves.component.html',
  styleUrls: ['./wolves.component.scss'],
  providers: [WolfService, HttpClient, ValidatorService]
})
export class WolvesComponent implements OnInit {
  wolvesLoading = true;
  updatingWolf = true;
  createWolfFlag = false;

  genderValues = [];
  wolves: Wolf[] = [];
  WolvesTableColumns = ['name', 'gender', 'updatedAt', 'actions'];

  selectedWolf: Wolf = null;
  selectedWolfBirthday: FormControl = null;

  updateWolfForm: FormGroup;
  createWolfForm: FormGroup;


  private wolfService: WolfService;
  private validatorService: ValidatorService;
  private snackbar: MatSnackBar;

  private route: ActivatedRoute;

  public dialog: MatDialog;

  constructor(wolfService: WolfService, validatorService: ValidatorService, snackbar: MatSnackBar, route: ActivatedRoute, dialog: MatDialog) {
    this.dialog = dialog;
    this.route = route;
    this.snackbar = snackbar;
    this.wolfService = wolfService;
    this.validatorService = validatorService;
    this.genderValues = Object.keys(Gender).filter(f => isNaN(Number(f)));

    // Create FormGroup definitions for the update form
    this.updateWolfForm = new FormGroup({
      name: new FormControl('', [Validators.required, validatorService.noWhitespaceValidator]),
      gender: new FormControl('', [Validators.required]),
      birthday: new FormControl('', [Validators.required, validatorService.dateIsInPastOrToday])
    });

    // Create FormGroup definitions for the create form
    this.createWolfForm = new FormGroup({
      name: new FormControl('', [Validators.required, validatorService.noWhitespaceValidator]),
      gender: new FormControl('', [Validators.required]),
      birthday: new FormControl('', [Validators.required, validatorService.dateIsInPastOrToday])
    });
  }

  ngOnInit(): void {
    this.getAllWolves();
    this.route.params.subscribe(params => {
      if (params.id === undefined){
        return;
      }

      const selectedWolfId = Number(params.id);
      this.wolfService.getWolfById(selectedWolfId).subscribe((wolf: Wolf) => {
        this.selectedWolf = wolf;
        this.updateWolfUpdateForm();
      }, (error: HttpErrorResponse) => {
        this.snackbar.open(error.error, 'close', {
          duration: 1500
        });
      });
    });
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

  createWolf(): void {
    if (this.createWolfForm.invalid){
      this.snackbar.open('Not all fields have been filled in correctly', 'close', {duration: 1500});
      return;
    }

    const wolf: Wolf = {
      id: 0,
      name: this.createWolfForm.controls.name.value,
      gender: this.createWolfForm.controls.gender.value,
      birthday: this.createWolfForm.controls.birthday.value,
      createdAt: null,
      updatedAt: null
    };

    this.wolfService.createWolf(wolf).subscribe(() => {
      this.snackbar.open('Successfully created wolf', 'close', {duration: 1500});

      this.getAllWolves();
      this.createWolfFlag = false;
    }, (error: HttpErrorResponse) => {
      // Create Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  updateWolf(id: number): void{
    this.updatingWolf = true;

    if (this.updateWolfForm.invalid){
      this.snackbar.open('Not all fields have been filled in correctly', 'close', {duration: 1500});
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

      // Reload data on the page
      this.getAllWolves();
      this.updateSelectedWolf();

      this.updatingWolf = false;
    }, (error: HttpErrorResponse) => {
      // Update Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  deleteWolf(id: number): void {
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {text: `Are you sure you want to permanently delete "${this.selectedWolf.name}"?`}
    });

    // Check if the user pressed, yes
    confirmDialog.afterClosed().subscribe(result => {
      if (!result){
        // If not, don't delete
        return;
      }

      // Execute the delete request
      this.wolfService.deleteWolf(id).subscribe(() => {
        this.snackbar.open('Successfully deleted', 'close', {duration: 1500});

        // Update the data and reset variables.
        this.getAllWolves();
        this.selectedWolf = null;
      });
    });
  }

  updateSelectedWolf(): void {
    this.wolfService.getWolfById(this.selectedWolf.id).subscribe(wolf => {
      this.selectedWolf = wolf;
      this.updateWolfUpdateForm();
    }, (error: HttpErrorResponse) => {
      // Update Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  updateWolfUpdateForm(): void {
    this.updateWolfForm.controls.name.setValue(this.selectedWolf.name);
    this.updateWolfForm.controls.gender.setValue(this.selectedWolf.gender);
    this.updateWolfForm.controls.birthday.setValue(this.selectedWolf.birthday);
  }

  selectWolf(id: number): void {
    this.createWolfFlag = false;
    this.selectedWolf = this.getWolfFromArray(id);
    this.updateWolfUpdateForm();
  }

  openCreateWolfForm(): void {
    this.selectedWolf = null;
    this.createWolfFlag = true;
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
