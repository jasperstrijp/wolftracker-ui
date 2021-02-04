import {IpackService} from './abstraction/ipack.service';
import {Observable} from 'rxjs';
import {Pack} from '../models/pack';

export class PackService implements IpackService{
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
    return undefined;
  }

  removeWolfFromPack(packId: number, wolfIf: number): Observable<object> {
    return undefined;
  }

  updatePack(pack: Pack): Observable<object> {
    return undefined;
  }
  }
