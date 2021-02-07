import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AppComponent } from './app.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app-routing.module';
import { HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import { AuthInterceptor} from './interceptors/auth.interceptor';
import { WolvesComponent } from './wolves/wolves.component';
import { PacksComponent } from './packs/packs.component';
import {MaterialModule} from './material.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {GoogleMapsModule} from '@angular/google-maps';
import {SelectWolfDialogComponent} from './dialog/select-wolf/select-wolf-dialog.component';
import {CommonModule} from '@angular/common';
import {ConfirmDialogComponent} from './dialog/confirm-dialog/confirm-dialog.component';
import {ErrorStateMatcher, ShowOnDirtyErrorStateMatcher} from '@angular/material/core';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    WolvesComponent,
    PacksComponent,
    SelectWolfDialogComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule,
    AppRoutingModule,
    HttpClientModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    GoogleMapsModule,
    CommonModule
  ],
  entryComponents: [
    SelectWolfDialogComponent
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true},
    {provide: ErrorStateMatcher, useClass: ShowOnDirtyErrorStateMatcher}],
  bootstrap: [AppComponent],
})

export class AppModule { }
