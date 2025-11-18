import { HttpClient, httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Song } from '../types';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  apiUrl: string = "http://localhost:4000";

  constructor(private http: HttpClient) {}

  getSongs() {
    return this.http.get(`${this.apiUrl}/songs`);
  }
}
