import { Component, OnInit } from '@angular/core';
import {Pack} from '../models/pack';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {PackService} from '../services/pack.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {ValidatorService} from '../services/validator.service';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Wolf} from '../models/wolf';
import {MatDialog} from '@angular/material/dialog';
import {SelectWolfDialogComponent} from '../dialog/select-wolf/select-wolf-dialog.component';
import {ConfirmDialogComponent} from '../dialog/confirm-dialog/confirm-dialog.component';
import {Subscription} from 'rxjs';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-packs',
  templateUrl: './packs.component.html',
  styleUrls: ['./packs.component.scss'],
  providers: [PackService, HttpClient, ValidatorService]
})
export class PacksComponent implements OnInit {
  packsLoading = true;
  createPackFlag = false;
  currentLocation: {lat: number, lng: number};

  packs: Pack[] = [];
  selectedPack: Pack = null;

  PacksTableColumns = ['name', 'updatedAt', 'actions'];
  selectedPackWolvesTableColumns = ['name', 'gender', 'birthday', 'actions'];

  packForm: FormGroup;

  private validatorService: ValidatorService;
  private packService: PackService;
  private snackbar: MatSnackBar;
  private dialog: MatDialog;
  private route: ActivatedRoute;

  constructor(
    packService: PackService,
    validatorService: ValidatorService,
    snackbar: MatSnackBar,
    dialog: MatDialog,
    route: ActivatedRoute) {
    this.route = route;
    this.dialog = dialog;
    this.snackbar = snackbar;
    this.packService = packService;
    this.validatorService = validatorService;

    // Create FormGroup definition for the form
    this.packForm = new FormGroup({
      name: new FormControl('', [Validators.required, validatorService.noWhitespaceValidator, validatorService.onlyLettersValidator])
    });
  }

  ngOnInit(): void {
    // Load all packs at the start
    this.getAllPacks();

    // Get the id parameter from the url, if present preload the pack
    this.route.params.subscribe(params => {
      if (params.id === undefined){
        return;
      }

      const selectedPackId = Number(params.id);
      this.selectPack(selectedPackId);
    });
  }

  // Data Methods
  getAllPacks(): void{
    this.packService.getPacks().subscribe((packs: Pack[]) => {
      // Sort the packs alphabetically
      this.packs = packs.sort((a, b) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });

      this.packsLoading = false;
    }, (error: HttpErrorResponse) => {
      // Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  updatePack(id: number): void {
    if (this.packForm.invalid){
      this.snackbar.open('Not all fields have been filled in correctly', 'close', {duration: 1500});
      return;
    }

    // Get the pack from the array of loaded packs and set values to from values.
    const packToUpdate = this.getPackFromArray(id);
    packToUpdate.name = this.packForm.controls.name.value;
    packToUpdate.latitude = this.selectedPack.latitude;
    packToUpdate.longitude = this.selectedPack.longitude;

    // Execute the update request
    this.packService.updatePack(packToUpdate).subscribe(() => {
      this.snackbar.open('Successfully updated', 'close', {duration: 1500});

      // Update local data
      this.getAllPacks();
      this.updateSelectedWolf();
    }, (error: HttpErrorResponse) => {
      // Create Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  deletePack(id: number): void{
    // Open confirm dialog
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {text: `Are you sure you want to permanently remove the pack "${this.selectedPack.name}"?`}
    });

    // If the result closed with 'Yes'
    confirmDialog.afterClosed().subscribe(result => {
      if (!result){
        return;
      }

      // Execute delete request
      this.packService.deletePack(id).subscribe(() => {
        this.snackbar.open('Successfully deleted', 'close', {duration: 1500});

        // Update local data and deselect pack.
        this.getAllPacks();
        this.selectedPack = null;
      }, (error: HttpErrorResponse) => {
        // Delete Failed
        this.snackbar.open(error.error, 'close', {
          duration: 1500
        });
      });
    });
  }

  createPack(): void {
    // All fields valid?
    if (this.packForm.invalid){
      this.snackbar.open('Not all fields have been filled in correctly', 'close', {duration: 1500});
      return;
    }

    // Fill data from FormGroup and current location data, saved to the current Pack.
    const pack: Pack = {
      id: 0,
      name: this.packForm.controls.name.value,
      latitude: this.selectedPack.latitude,
      longitude: this.selectedPack.longitude,
      createdAt: null,
      updatedAt: null,
      wolves: null
    };

    // Execute create statement
    this.packService.createPack(pack).subscribe((newId: number) => {
      this.snackbar.open('Successfully created pack', 'close', {duration: 1500});

      // Reload packs and select the newly added packs for further editing.
      this.getAllPacks();
      this.selectPack(newId);
      this.createPackFlag = false;
    }, (error: HttpErrorResponse) => {
      // Create Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  removeWolfFromPack(packId: number, wolfId: number): void {
    // Set name fields for confirm string
    const wolfName = this.selectedPack.wolves.find(wolf => wolf.id === wolfId).name;
    const packName = this.selectedPack.name;

    // Open confirmation dialog and check if closed with 'yes'
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {text: `Are you sure you want to remove the wolf "${wolfName}" from the pack "${packName}"?`}
    });

    confirmDialog.afterClosed().subscribe((result: boolean) => {
      if (!result){
        return;
      }

      // Execute remove wolf from pack request
      this.packService.removeWolfFromPack(packId, wolfId).subscribe(() => {
        this.snackbar.open('Successfully removed Wolf from the Pack', 'close', {duration: 1500});
        this.updateSelectedWolf();
      }, (error: HttpErrorResponse) => {
        // Request Failed
        this.snackbar.open(error.error, 'close', {
          duration: 1500
        });
      });
    });
  }

  addWolfToPack(): void {
    // Open the select wolf dialog
    const dialogRef = this.dialog.open(SelectWolfDialogComponent, {
      data: {wolvesInPack: this.selectedPack.wolves},
      width: '1000px'
    });

    dialogRef.afterClosed().subscribe(wolvesToAdd => {
      // Where any wolfs chosen in the dialog
      if (wolvesToAdd === null || wolvesToAdd.length === 0) {
        return;
      }

      let counter = 0;
      // If multiple wolfs where chosen in the dialog, the requests has to be called once for each wolf to be added.
      // No request exists allowing for multiple wolfs to be added at once, this way the user will still experience the existence of such
      // a request.
      for (const wolf of wolvesToAdd) {
        this.packService.addWolfToPack(this.selectedPack.id, wolf.id).subscribe(() => {
          counter++;

          // If all wolves have been added, show a Snackbar and update the current selected pack to see the new changes.
          if (counter === wolvesToAdd.length){
            this.snackbar.open(`Successfully added ${wolvesToAdd.length > 1 ? 'wolves' : 'wolf'} to pack!`, 'close', {duration: 1500});
            this.updateSelectedWolf();
          }
        }, (error: HttpErrorResponse) => {
          // Request Failed
          this.snackbar.open(error.error, 'close', {
            duration: 1500
          });
        });
      }
    });
  }
  // End Data Methods

  // Events
  mapClick(event: google.maps.MapMouseEvent | google.maps.IconMouseEvent): void {
    this.selectedPack.latitude = event.latLng.lat();
    this.selectedPack.longitude = event.latLng.lng();
  }

  btnSaveClick(): void {
    // The save button has multiple actions depending on the createPackFlag
    if (this.createPackFlag){
      this.createPack();
    }else{
      this.updatePack(this.selectedPack.id);
    }
  }

  // Helper Methods
  selectPack(id: number): void {
    // Get the selected pack from the API, otherwise we cannot show the wolves in the pack.
    this.createPackFlag = false;
    this.packService.getPackById(id).subscribe((pack: Pack) => {
      // Update the local data
      this.selectedPack = pack;
      // Set the values of the selected pack in the form fields
      this.updatePackForm();
    }, (error: HttpErrorResponse) => {
      // Request Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  // Reload the selected wolf from the API
  updateSelectedWolf(): void {
    this.selectPack(this.selectedPack.id);
  }

  openCreatePackForm(): void {
    const location = this.getCurrentLocation();
    this.selectedPack = new Pack(0, '', location.lat, location.lng, null, null, []);

    // Reset the form values to update the fields
    this.updatePackForm();
    this.createPackFlag = true;
  }

  closeSelectedPack(): void {
    this.selectedPack = null;
  }

  // Get a pack by Id from the array of loaded packs. Prevents unneeded connections.
  getPackFromArray(id: number): Pack{
    if (this.packs === null || this.packs.length === 0){
      return null;
    }

    return this.packs.find((wolf => wolf.id === id));
  }

  // Update form fields with the data of the selected Pack
  updatePackForm(): void {
    this.packForm.controls.name.setValue(this.selectedPack.name);
  }

  getCurrentLocation(): {lat: number, lng: number}{
    // Get the current location
    let location: {lat: number, lng: number} = {lat: 0, lng: 0};
    navigator.geolocation.getCurrentPosition((position) => {
      location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });

    return location;
  }
}
