import {IpackService} from './abstraction/ipack.service';
import {Observable} from 'rxjs';
import {Pack} from '../models/pack';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {Injectable} from '@angular/core';
import {map} from 'rxjs/operators';
import {Wolf} from '../models/wolf';

@Injectable()
export class PackService implements IpackService {
  private http: HttpClient;
  private readonly apiUrl: string;

  constructor(http: HttpClient) {
    this.http = http;
    this.apiUrl = environment.apiUrl;
  }

  addWolfToPack(packId: number, wolfId: number): Observable<object> {
    const requestUrl = `${this.apiUrl}/packs/${packId}/wolf/${wolfId}`;
    return this.http.post(requestUrl, null);
  }

  createPack(pack: Pack): Observable<number> {
    const requestUrl = `${this.apiUrl}/packs`;
    const data = {
      name: pack.name,
      lng: pack.longitude.toString(),
      lat: pack.latitude.toString()
    };

    return this.http.post(requestUrl, data).pipe(
      map((response: any) => {
        return response.id;
      })
    );
  }

  deletePack(id: number): Observable<object> {
    const requestUrl = `${this.apiUrl}/packs/${id}`;
    return this.http.delete(requestUrl);
  }

  getPackById(id: number): Observable<Pack> {
    const requestUrl = `${this.apiUrl}/packs/${id}`;
    return this.http.get(requestUrl).pipe(
      map((response: any) => {
        const wolves: Wolf[] = [];

        // Map the wolves data to an array of wolves objects
        for (const key of Object.keys(response.wolves)){
          wolves.push({
            id: response.wolves[key].id,
            name: response.wolves[key].name,
            gender: response.wolves[key].gender,
            birthday: response.wolves[key].birthday,
            createdAt: response.wolves[key].createdAt,
            updatedAt: response.wolves[key].updatedAt
          });
        }

        // Match the pack's data to the pack object
        return {
          id: response.id,
          name: response.name,
          latitude: response.lat,
          longitude: response.lng,
          createdAt: response.created_at,
          updatedAt: response.updated_at,
          wolves
        };
      }));
  }

  getPacks(): Observable<Pack[]> {
    const requestUrl = `${this.apiUrl}/packs`;
    return this.http.get(requestUrl).pipe(
      map((response: Response) => {
        const packsArray: Pack[] = [];

        // Map the packs data to the an array of Pack objects
        for (const key of Object.keys(response)) {
          packsArray.push({
            id: response[key].id,
            name: response[key].name,
            latitude: response[key].lat,
            longitude: response[key].lng,
            createdAt: response[key].created_at,
            updatedAt: response[key].updated_at,
            wolves: null
          });
        }

        return packsArray;
      }));
  }

  removeWolfFromPack(packId: number, wolfId: number): Observable<object> {
    const requestUrl = `${this.apiUrl}/packs/${packId}/wolf/${wolfId}`;
    return this.http.delete(requestUrl);
  }

  updatePack(pack: Pack): Observable<object> {
    const requestUrl = `${this.apiUrl}/packs/${pack.id}`;
    const data = {
      name: pack.name,
      lng: pack.longitude,
      lat: pack.latitude
    };

    return this.http.put(requestUrl, data);
  }
}
