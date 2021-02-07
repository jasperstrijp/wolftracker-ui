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

  constructor(packService: PackService, validatorService: ValidatorService, snackbar: MatSnackBar, dialog: MatDialog, route: ActivatedRoute) {
    this.route = route;
    this.dialog = dialog;
    this.snackbar = snackbar;
    this.packService = packService;
    this.validatorService = validatorService;

    // Create FormGroup definitions for the update form
    this.packForm = new FormGroup({
      name: new FormControl('', [Validators.required, validatorService.noWhitespaceValidator, validatorService.onlyLettersValidator])
    });
  }

  ngOnInit(): void {
    this.getAllPacks();
    this.route.params.subscribe(params => {
      if (params.id === undefined){
        return;
      }

      const selectedPackId = Number(params.id);
      this.selectPack(selectedPackId);
    });

    navigator.geolocation.getCurrentPosition((position) => {
      this.currentLocation = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
    });
  }

  // Data Methods
  getAllPacks(): void{
    this.packService.getPacks().subscribe((packs: Pack[]) => {
      this.packs = packs.sort((a, b) => {
        if (a.name < b.name) { return -1; }
        if (a.name > b.name) { return 1; }
        return 0;
      });

      this.packsLoading = false;
    }, (error: HttpErrorResponse) => {
      // Create Failed
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

    const packToUpdate = this.getPackFromArray(id);
    packToUpdate.name = this.packForm.controls.name.value;
    packToUpdate.latitude = this.selectedPack.latitude;
    packToUpdate.longitude = this.selectedPack.longitude;

    this.packService.updatePack(packToUpdate).subscribe(() => {
      this.snackbar.open('Successfully updated', 'close', {duration: 1500});

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
    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {text: `Are you sure you want to permanently remove the pack "${this.selectedPack.name}"?`}
    });

    confirmDialog.afterClosed().subscribe(result => {
      if (!result){
        return;
      }

      this.packService.deletePack(id).subscribe(() => {
        this.snackbar.open('Successfully deleted', 'close', {duration: 1500});

        this.getAllPacks();
        this.selectedPack = null;
      }, (error: HttpErrorResponse) => {
        // Create Failed
        this.snackbar.open(error.error, 'close', {
          duration: 1500
        });
      });
    });
  }

  createPack(): void {
    if (this.packForm.invalid){
      this.snackbar.open('Not all fields have been filled in correctly', 'close', {duration: 1500});
      return;
    }

    // Fill data from FormGroup
    const pack: Pack = {
      id: 0,
      name: this.packForm.controls.name.value,
      latitude: this.selectedPack.latitude,
      longitude: this.selectedPack.longitude,
      createdAt: null,
      updatedAt: null,
      wolves: null
    };

    this.packService.createPack(pack).subscribe((newId: number) => {
      this.snackbar.open('Successfully created pack', 'close', {duration: 1500});

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
    const wolfName = this.selectedPack.wolves.find(wolf => wolf.id === wolfId).name;
    const packName = this.selectedPack.name;

    const confirmDialog = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data: {text: `Are you sure you want to remove the wolf "${wolfName}" from the pack "${packName}"?`}
    });

    confirmDialog.afterClosed().subscribe((result: boolean) => {
      if (!result){
        return;
      }

      this.packService.removeWolfFromPack(packId, wolfId).subscribe(() => {
        this.snackbar.open('Successfully removed Wolf from the Pack', 'close', {duration: 1500});
        this.updateSelectedWolf();
      });
    });
  }

  openAddWolfToPack(): void {
    const dialogRef = this.dialog.open(SelectWolfDialogComponent, {
      data: {wolvesInPack: this.selectedPack.wolves},
      width: '1000px'
    });

    dialogRef.afterClosed().subscribe(wolvesToAdd => {
      if (wolvesToAdd === null || wolvesToAdd.length === 0) {
        return;
      }

      let counter = 0;
      for (const wolf of wolvesToAdd) {
        this.packService.addWolfToPack(this.selectedPack.id, wolf.id).subscribe(() => {
          counter++;
          if (counter === wolvesToAdd.length){
            this.snackbar.open(`Successfully added ${wolvesToAdd.length > 1 ? 'wolves' : 'wolf'} to pack!`, 'close', {duration: 1500});
            this.updateSelectedWolf();
          }
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
    if (this.createPackFlag){
      this.createPack();
    }else{
      this.updatePack(this.selectedPack.id);
    }
  }

  // Helper Methods
  selectPack(id: number): void {
    this.createPackFlag = false;
    this.packService.getPackById(id).subscribe((pack: Pack) => {
      this.selectedPack = pack;
      this.updatePackForm();
    });
  }

  openCreatePackForm(): void {
    this.selectedPack = new Pack(0, '', this.currentLocation.lat, this.currentLocation.lng, null, null, []);
    this.updatePackForm();
    this.createPackFlag = true;
  }

  closeSelectedPack(): void {
    this.selectedPack = null;
  }

  getPackFromArray(id: number): Pack{
    if (this.packs === null || this.packs.length === 0){
      return null;
    }

    return this.packs.find((wolf => wolf.id === id));
  }

  updateSelectedWolf(): void {
    this.packService.getPackById(this.selectedPack.id).subscribe((pack: Pack) => {
      console.log(pack);
      this.selectedPack = pack;
      this.updatePackForm();
    }, (error: HttpErrorResponse) => {
      // Update Failed
      this.snackbar.open(error.error, 'close', {
        duration: 1500
      });
    });
  }

  updatePackForm(): void {
    this.packForm.controls.name.setValue(this.selectedPack.name);
  }
}
