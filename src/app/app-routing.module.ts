import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import {DashboardComponent} from './dashboard/dashboard.component';
import {WolvesComponent} from './wolves/wolves.component';
import {PacksComponent} from './packs/packs.component';

const routes: Routes = [
  {path: '', component: DashboardComponent},
  {path: 'dashboard', component: DashboardComponent},
  {path: 'wolves', component: WolvesComponent},
  {path: 'packs', component: PacksComponent},
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule, RouterModule.forRoot(routes)
  ]
})
export class AppRoutingModule { }
