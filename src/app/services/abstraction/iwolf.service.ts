import {Observable} from 'rxjs';
import {Wolf} from '../../models/wolf';

export interface IwolfService {
  getWolves(): Observable<Wolf[]>;
  createWolf(wolf: Wolf): Observable<object>;
  getWolfById(id: number): Observable<Wolf>;
  updateWolf(wolf: Wolf): Observable<object>;
  deleteWolf(id: number): Observable<object>;
}
