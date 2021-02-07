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

  constructor(
    wolfService: WolfService,
    validatorService: ValidatorService,
    snackbar: MatSnackBar,
    route: ActivatedRoute,
    dialog: MatDialog) {
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

    // If Id is present in URL, preselect that wolf
    this.preselectWolf();
  }

  // REQUEST METHODS
  getAllWolves(): void {
    // Get all wolves and sort alphabetically
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
    // If all fields are valid
    if (this.createWolfForm.invalid){
      this.snackbar.open('Not all fields have been filled in correctly', 'close', {duration: 1500});
      return;
    }

    // Create a new wolf and load values from form
    const wolf: Wolf = {
      id: 0,
      name: this.createWolfForm.controls.name.value,
      gender: this.createWolfForm.controls.gender.value,
      birthday: this.createWolfForm.controls.birthday.value,
      createdAt: null,
      updatedAt: null
    };

    // Execute request
    this.wolfService.createWolf(wolf).subscribe(() => {
      this.snackbar.open('Successfully created wolf', 'close', {duration: 1500});

      // Update local data and close create window.
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
    // If all fields are valid
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
    }, (error: HttpErrorResponse) => {
      // Update Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  deleteWolf(id: number): void {
    // Open confirmation dialog.
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {text: `Are you sure you want to permanently delete "${this.selectedWolf.name}"?`}
    });

    // Check if the user pressed 'yes'
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
      }, (error: HttpErrorResponse) => {
        // Delete Failed
        this.snackbar.open(error.error, 'close', {
          duration: 1500
        });
      });
    });
  }

  updateSelectedWolf(): void {
    // Request the wolf by id and set as selected wolf
    this.wolfService.getWolfById(this.selectedWolf.id).subscribe(wolf => {
      this.selectedWolf = wolf;

      // Update the form fields
      this.updateWolfUpdateForm();
    }, (error: HttpErrorResponse) => {
      // Update Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  // END REQUEST METHODS

  // HELPER METHODS
  preselectWolf(): void {
    // Get the wolf Id from the URL parameter
    this.route.params.subscribe(params => {
      if (params.id === undefined){
        return;
      }

      const selectedWolfId = Number(params.id);

      // Request the data
      this.wolfService.getWolfById(selectedWolfId).subscribe((wolf: Wolf) => {
        // Save data locally and update form fields
        this.selectedWolf = wolf;
        this.updateWolfUpdateForm();
      }, (error: HttpErrorResponse) => {
        this.snackbar.open(error.error, 'close', {
          duration: 1500
        });
      });
    });
  }

  // Set the form fields to the currently selected wolf values
  updateWolfUpdateForm(): void {
    this.updateWolfForm.controls.name.setValue(this.selectedWolf.name);
    this.updateWolfForm.controls.gender.setValue(this.selectedWolf.gender);
    this.updateWolfForm.controls.birthday.setValue(this.selectedWolf.birthday);
  }

  // Select a wolf by id
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

  closeSelectedWolf(): void {
    this.selectedWolf = null;
  }
}
