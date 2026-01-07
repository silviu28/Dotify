import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal, effect } from '@angular/core';
import { Album, DeezerResponse, Song } from '../types';
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
  
  // Playlist-ul principal (contextul curent: album, search results, etc.)
  playlist = signal<Song[]>([]);
  recentlyPlayed = signal<Song[]>([]); // Now managed by the service

  // NOU: Coada de prioritate (melodiile adăugate manual prin Add to Queue)
  queue = signal<Song[]>([]);

  albums = signal<Album[]>([]);
  artistNames = signal<string[]>([]);
  songs = signal<Song[]>([]);

  constructor() {
    this.loadData();
    // Debugging: Să vedem în consolă când se schimbă piesa
    effect(() => {
      const song = this.currentSong();
      if (song) {
        console.log(`Now Playing: ${song.title}`);
      }
    });
  }

  setQueue(songs: Song[]) {
    this.playlist.set(songs);
    // Opțional: Când schimbi playlist-ul complet, poți goli coada de prioritate sau o poți păstra.
    // De obicei se păstrează, deci nu apelăm this.queue.set([]) aici.
  }

  loadData() {
    this.getSongs().pipe(map(res => {
      this.songs.set(res.songs);
      this.artistNames.set(this.aggregateArtistNames(res.songs));
      this.albums.set(this.aggregateAlbums(res.songs));
      console.log("Built listings from response stream", this.artistNames(), this.albums());
      return res;
    })).subscribe();
  }

  // builds the list of albums based on received songs
  aggregateAlbums(songs: Song[]): Album[] {
    const albums = new Map<string, Album>();
    songs.forEach((song) => {
      if (!albums.has(song.album)) {
        // if album doesn't exist, create it
        albums.set(song.album, {
          name: song.album,
          coverArt: song.albumArt || "",
          songs: [song],
          artist: song.artist,
        });
      } else {
        // if album exists, update it
        const existingAlbum = albums.get(song.album)!;
        albums.set(song.album, {
          ...existingAlbum,
          songs: [... existingAlbum.songs, song],
        });
      }
    });

    return Array.from(albums.values());
  }

  // build unique artist names list based on received songs
  aggregateArtistNames(songs: Song[]): string[] {
    const artists = new Set<string>();
    songs.forEach(song => artists.add(song.artist));
    return Array.from(artists.keys());
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
    
    this.addToRecentlyPlayed(song);
  }

  private addToRecentlyPlayed(song: Song) {
    const filtered = this.recentlyPlayed().filter(s => s.filename !== song.filename);
    const newList = [song, ...filtered].slice(0, 10);
    this.recentlyPlayed.set(newList);
  }

  // --- LOGICA DE PLAY NEXT (MODIFICATĂ PENTRU QUEUE) ---
  playNext() {
    // 1. Verificăm întâi Coada de Prioritate (Queue)
    const userQueue = this.queue();
    
    if (userQueue.length > 0) {
      console.log("🛑 Priority Queue found! Playing:", userQueue[0].title);
      
      const nextSong = userQueue[0];
      
      // O scoatem din coadă și o redăm (stergem primul element)
      this.queue.update(q => q.slice(1)); 
      this.playSong(nextSong);
      return;
    }

    // 2. Dacă nu e nimic în coadă, continuăm lista normală (Playlist)
    const current = this.currentSong();
    const list = this.playlist();
    

    if (!current || list.length === 0) {
      console.warn("❌ Nu am piesă curentă sau playlist gol.");
      return;
    }

    // Folosim findIndex după filename pentru siguranță
    const currentIndex = list.findIndex(s => s.filename === current.filename);
    console.log("Index găsit în playlist:", currentIndex);

    if (currentIndex === -1) {
      console.error("❌ Piesa curentă nu a fost găsită în playlist-ul activ! Redau prima piesă.");
      this.playSong(list[0]);
      return;
    }

    if (currentIndex < list.length - 1) {
      console.log("⏭️ Trec la piesa următoare din playlist:", list[currentIndex + 1].title);
      this.playSong(list[currentIndex + 1]);
    } else {
      console.log("🔄 Loop la început:", list[0].title);
      this.playSong(list[0]);
    }
  }

  playPrev() {
    const current = this.currentSong();
    const list = this.playlist();

    if (!current || list.length === 0) return;

    const currentIndex = list.findIndex(s => s.filename === current.filename);

    if (currentIndex === -1) return;

    if (currentIndex > 0) {
      this.playSong(list[currentIndex - 1]);
    } else {
      this.playSong(list[list.length - 1]);
    }
  }

  // --- MODIFICAT: Adaugă în coada de prioritate separată ---
  addToQueue(song: Song) {
    // Adăugăm piesa la sfârșitul cozii de prioritate
    this.queue.update(currentQueue => [...currentQueue, song]);
    console.log(`✅ Added to Priority Queue: ${song.title}. Queue length: ${this.queue().length + 1}`);
  }

  // --- MODIFICAT: Adaugă la începutul cozii de prioritate ---
  playNextInQueue(song: Song) {
    // O punem chiar prima în coada de prioritate
    this.queue.update(currentQueue => [song, ...currentQueue]);
    console.log(`⚡ Will play next (Priority): ${song.title}`);
  }
}