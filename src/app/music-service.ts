import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { DeezerResponse, Song } from '../types';
import { map, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class MusicService {
  private http = inject(HttpClient);
  private onPlaySubject = new Subject<Song>();
  onPlay = this.onPlaySubject.asObservable();

  apiUrl = "http://localhost:4000";
  currentSong = signal<Song | null>(null);
  playlist = signal<Song[]>([]);

  setQueue(songs: Song[]) {
    this.playlist.set(songs);
  }

  getSongs() {
    return this.http.get<{songs: Song[]}>(`${this.apiUrl}/songs`);
  }

  getSongsByName(query: string) {
    return this.getSongs().pipe(
      map(data => data.songs.filter(song => song.title.toLowerCase().includes(query.toLowerCase())))
    );
  }

  getSongStreamUrl(filename: string): string {
    return `${this.apiUrl}/stream/${filename}`;
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
    return this.http.get<DeezerResponse>(
      `http://localhost:4000/deezer/artist/${artistId}`
    );
  }

  playSong(song: Song) {
    this.currentSong.set(song);
    this.onPlaySubject.next(song);
  }

  playNext() {
    const current = this.currentSong();
    const list = this.playlist();
    

    if (!current || list.length === 0) {
      console.warn("❌ Nu am piesă curentă sau playlist gol.");
      return;
    }

    const currentIndex = list.findIndex(s => s.filename === current.filename);
    console.log("Index găsit:", currentIndex);

    if (currentIndex === -1) {
      console.error("❌ Piesa curentă nu a fost găsită în playlist-ul activ!");
      this.currentSong.set(list[0]);
      return;
    }

    if (currentIndex < list.length - 1) {
      console.log("⏭️ Trec la piesa următoare:", list[currentIndex + 1].title);
      this.currentSong.set(list[currentIndex + 1]);
    } else {
      console.log("🔄 Loop la început:", list[0].title);
      this.currentSong.set(list[0]);
    }
  }

  playPrev() {
    const current = this.currentSong();
    const list = this.playlist();

    if (!current || list.length === 0) return;

    const currentIndex = list.findIndex(s => s.filename === current.filename);

    if (currentIndex === -1) return;

    if (currentIndex > 0) {
      this.currentSong.set(list[currentIndex - 1]);
    } else {
      this.currentSong.set(list[list.length - 1]);
    }
  }
}