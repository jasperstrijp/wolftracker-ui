import {Observable} from 'rxjs';
import {Pack} from '../../models/pack';

export interface IpackService {
  getPacks(): Observable<Pack[]>;
  createPack(pack: Pack): Observable<object>;
  getPackById(id: number): Observable<Pack>;
  updatePack(pack: Pack): Observable<object>;
  deletePack(id: number): Observable<object>;
  addWolfToPack(packId: number, wolfId: number): Observable<object>;
  removeWolfFromPack(packId: number, wolfIf: number): Observable<object>;
}
