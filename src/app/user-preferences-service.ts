import { Injectable, OnDestroy, signal } from '@angular/core';
import { Album, Prefs, Song } from '../types';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService implements OnDestroy {
  username = signal<string>("user");
  favoriteSongs = signal<Song[]>([]);
  favoriteAlbums = signal<Album[]>([]);
  favoriteArtists = signal<string[]>([]);

  constructor() {
    // parse user preferences from localStorage object
    const prefs: Prefs = JSON.parse(localStorage.getItem("prefs")!);
    if (prefs.username) {
      this.username.set(prefs.username);
    }
    if (prefs.favoriteSongs) {
      this.favoriteSongs.set(prefs.favoriteSongs);
    }
    if (prefs.favoriteAlbums) {
      this.favoriteAlbums.set(prefs.favoriteAlbums);
    }
    if (prefs.favoriteArtists) {
      this.favoriteArtists.set(prefs.favoriteArtists);
    }
  }

  savePreferences() {
    const prefs: Prefs = {};
    prefs.username = this.username();
    prefs.favoriteSongs = this.favoriteSongs();
    prefs.favoriteAlbums = this.favoriteAlbums();
    prefs.favoriteArtists = this.favoriteArtists();
    localStorage.setItem("prefs", JSON.stringify(prefs));
  }

  // save preferences on dispose
  ngOnDestroy() {
    this.savePreferences();
  }
}
