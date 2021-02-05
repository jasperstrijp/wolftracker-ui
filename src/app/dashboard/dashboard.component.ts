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

  WolvesTableColumns = ['name', 'updatedAt'];
  PacksTableColumns = ['name', 'updatedAt'];

  private wolfService: WolfService;
  private packService: PackService;
  private snackbar: MatSnackBar;

  constructor(wolfService: WolfService, packService: PackService, snackbar: MatSnackBar) {
    this.wolfService = wolfService;
    this.packService = packService;
    this.snackbar = snackbar;
  }

  ngOnInit(): void {
    this.getLastUpdatedWolves(5);
    this.getLastUpdatedPacks(5);
  }

  getLastUpdatedWolves(count: number): void {
    this.wolfService.getWolves().subscribe((wolves: Wolf[]) => {
      const sortedArray = wolves.sort((a, b) => {
        return b.updatedAt > a.updatedAt ? 1 : -1;
      });

      if (sortedArray.length >= count) {
        this.wolves = sortedArray.slice(0, count);
      } else {
        this.wolves = sortedArray;
      }

      this.wolvesLoading = false;
    }, (error: HttpErrorResponse) => {
      this.snackbar.open(error.error, 'close', {duration: 3000});
      return null;
    });
  }

  getLastUpdatedPacks(count: number): void {
    this.packService.getPacks().subscribe((packs: Pack[]) => {
      const sortedArray = packs.sort((a, b) => {
        return b.updatedAt > a.updatedAt ? 1 : -1;
      });

      if (sortedArray.length >= count) {
        this.packs = sortedArray.slice(0, count);
      } else {
        this.packs = sortedArray;
      }

      this.packsLoading = false;
    }, (error: HttpErrorResponse) => {
      this.snackbar.open(error.error, 'close', {duration: 3000});
    });
  }

  wait(ms: number): void{
    const start = new Date().getTime();
    let end = start;
    while (end < start + ms) {
      end = new Date().getTime();
    }
  }
}
