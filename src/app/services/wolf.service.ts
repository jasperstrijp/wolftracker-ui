import {IwolfService} from './abstraction/iwolf.service';
import {Wolf} from '../models/wolf';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';

@Injectable()
export class WolfService implements IwolfService{
  private http: HttpClient;
  private readonly apiUrl: string;

  constructor(http: HttpClient) {
    this.http = http;
    this.apiUrl = environment.apiUrl;
  }

  createWolf(wolf: Wolf): Observable<object> {
    return undefined;
  }

  deleteWolf(id: number): Observable<object> {
    return undefined;
  }

  getWolfById(id: number): Observable<Wolf> {
    return undefined;
  }

  getWolves(): Observable<Wolf[]> {
    const requestUrl = this.apiUrl + '/wolves';
    return this.http.get<Wolf[]>(requestUrl);
  }

  updateWolf(wolf: Wolf): Observable<object> {
    return undefined;
  }
}
