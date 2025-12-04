import { HttpClient } from '@angular/common/http';
import { Injectable, resource } from '@angular/core';
import { Song } from '../types';
import { map } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  apiUrl: string = "http://localhost:4000";

  constructor(private http: HttpClient) {}

  getSongs() {
    return this.http.get<{songs: Song[]}>(`${this.apiUrl}/songs`);
  }

  getSongsByName(query: string) {
    return this.getSongs().pipe(
      map(data => data.songs.filter(song => song.title.toLowerCase().includes(query.toLowerCase())))
      );
  }

  getSongsByArtist(artist: string) {
    return this.getSongs().pipe(
      map(data => data.songs.filter(song => song.artist.toLowerCase() === artist.toLowerCase()))
    );
  }

  getByQuery(query: string) {
    return this.getSongs().pipe(
      map(data => data.songs.filter(song => song.title.toLowerCase().includes(query) || song.artist.includes(query)))
    );
  }

  getArtistData(artistId: number) {
    return this.http.get(`https://api.deezer.com/artist/${artistId}`);
  }
}
