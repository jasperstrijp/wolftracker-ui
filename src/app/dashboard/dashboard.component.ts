import { Component, OnInit } from '@angular/core';
import {WolfService} from '../services/wolf.service';
import {HttpClient, HttpErrorResponse} from '@angular/common/http';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Wolf} from '../models/wolf';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  providers: [WolfService, HttpClient]
})
export class DashboardComponent implements OnInit {

  wolves: Wolf[];

  private wolfService: WolfService;
  private snackbar: MatSnackBar;

  constructor(wolfService: WolfService, snackbar: MatSnackBar) {
    this.wolfService = wolfService;
    this.snackbar = snackbar;
  }

  ngOnInit(): void {
    this.wolfService.getWolves().subscribe((wolves: Wolf[]) => {
      this.wolves = wolves;
    }, (error: HttpErrorResponse) => {
      this.snackbar.open(error.error, 'close', {duration: 3000});
    });
  }

}
