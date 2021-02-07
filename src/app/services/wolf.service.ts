import {IwolfService} from './abstraction/iwolf.service';
import {Wolf} from '../models/wolf';
import {Observable} from 'rxjs';
import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {environment} from '../../environments/environment';
import {map} from 'rxjs/operators';
import {DatePipe} from '@angular/common';

@Injectable()
export class WolfService implements IwolfService{
  private http: HttpClient;
  private readonly apiUrl: string;

  constructor(http: HttpClient) {
    this.http = http;
    this.apiUrl = environment.apiUrl;
  }

  createWolf(wolf: Wolf): Observable<object> {
    const requestUrl = `${this.apiUrl}/wolves`;
    const data = {
      name: wolf.name,
      gender: wolf.gender,
      birthday: this.formatDate(wolf.birthday, 'yyyy-MM-dd')
    };

    return this.http.post(requestUrl, data);
  }

  deleteWolf(id: number): Observable<object> {
    const requestUrl = `${this.apiUrl}/wolves/${id}`;
    return this.http.delete(requestUrl);
  }

  getWolfById(id: number): Observable<Wolf> {
    const requestUrl = `${this.apiUrl}/wolves/${id}`;
    return this.http.get(requestUrl).pipe(
      map((response: any) => {
        return ({
          id: response.id,
          name: response.name,
          gender: response.gender,
          birthday: response.birthday,
          createdAt: response.created_at,
          updatedAt: response.updated_at
        });
      })
    );
  }

  getWolves(): Observable<Wolf[]> {
    const requestUrl = `${this.apiUrl}/wolves`;
    return this.http.get(requestUrl).pipe(
      map((response: Response) => {
        const wolvesArray: Wolf[] = [];

        for (const key of Object.keys(response)){
          wolvesArray.push({
            id: response[key].id,
            name: response[key].name,
            gender: response[key].gender,
            birthday: response[key].birthday,
            createdAt: response[key].created_at,
            updatedAt: response[key].updated_at
          });
        }

        return wolvesArray;
      })
    );
  }

  updateWolf(wolf: Wolf): Observable<object> {
    const requestUrl = `${this.apiUrl}/wolves/${wolf.id}`;
    const formattedBirthday = this.formatDate(wolf.birthday, 'yyyy-MM-dd');
    const data = {
      name: wolf.name,
      gender: wolf.gender,
      birthday: formattedBirthday
    };

    return this.http.put(requestUrl, data);
  }

  private formatDate(date: Date, format: string): string{
    return new DatePipe('en-US').transform(date, format);
  }
}
