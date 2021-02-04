import {IpackService} from './abstraction/ipack.service';
import {Observable} from 'rxjs';
import {Pack} from '../models/pack';
import {Wolf} from '../models/wolf';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';

@Injectable()
export class PackService implements IpackService{
  private http: HttpClient;
  private readonly apiUrl: string;

  constructor(http: HttpClient) {
    this.http = http;
    this.apiUrl = environment.apiUrl;
  }

  addWolfToPack(packId: number, wolfId: number): Observable<object> {
    return undefined;
  }

  createPack(pack: Pack): Observable<object> {
    return undefined;
  }

  deletePack(id: number): Observable<object> {
    return undefined;
  }

  getPackById(id: number): Observable<Pack> {
    return undefined;
  }

  getPacks(): Observable<Pack[]> {
    const requestUrl = this.apiUrl + '/packs';
    return this.http.get<Pack[]>(requestUrl);
  }

  removeWolfFromPack(packId: number, wolfIf: number): Observable<object> {
    return undefined;
  }

  updatePack(pack: Pack): Observable<object> {
    return undefined;
  }
  }
