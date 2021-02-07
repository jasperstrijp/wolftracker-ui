import {Component, OnInit, ViewChild} from '@angular/core';
import {WolfService} from '../services/wolf.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Wolf} from '../models/wolf';
import {PackService} from '../services/pack.service';
import {Pack} from '../models/pack';
import {Gender} from '../models/gender.enum';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers: [WolfService, PackService, HttpClient]
})
export class DashboardComponent implements OnInit {
  wolvesLoading = true;
  packsLoading = true;

  wolves: Wolf[] = [];
  packs: Pack[] = [];

  WolvesTableColumns = ['name', 'updatedAt', 'actions'];
  PacksTableColumns = ['name', 'updatedAt', 'actions'];

  private wolfService: WolfService;
  private packService: PackService;
  private snackbar: MatSnackBar;

  constructor(wolfService: WolfService, packService: PackService, snackbar: MatSnackBar) {
    this.wolfService = wolfService;
    this.packService = packService;
    this.snackbar = snackbar;
  }

  ngOnInit(): void {
    // Load Data
    this.getLastUpdatedWolves(5);
    this.getLastUpdatedPacks(5);
  }

  getLastUpdatedWolves(maxNrOfItems: number): void {
    this.wolfService.getWolves().subscribe((wolves: Wolf[]) => {
      this.wolves = this.sortArrayAndSliceArray(wolves, maxNrOfItems);

      this.wolvesLoading = false;
    }, (error: HttpErrorResponse) => {
      this.snackbar.open(error.error, 'close', {duration: 3000});
      return null;
    });
  }

  getLastUpdatedPacks(maxNrOfItems: number): void {
    this.packService.getPacks().subscribe((packs: Pack[]) => {

      this.packs = this.sortArrayAndSliceArray(packs, maxNrOfItems);
      this.packsLoading = false;
    }, (error: HttpErrorResponse) => {
      this.snackbar.open(error.error, 'close', {duration: 3000});
    });
  }

  // Sort the arrays on update Date and short to specified nr of items.
  sortArrayAndSliceArray(array: any[], nrOfItems: number): any[]{
    let sortedArray = array.sort((a, b) => {
      return b.updatedAt > a.updatedAt ? 1 : -1;
    });

    if (sortedArray.length >= nrOfItems) {
      sortedArray = sortedArray.slice(0, nrOfItems);
    }

    return sortedArray;
  }
}
