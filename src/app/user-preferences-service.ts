import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { Album, Playlist, Prefs, Song } from '../types';

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService implements OnDestroy {
  username = signal<string>("user");
  favoriteSongs = signal<Song[]>([]);
  favoriteAlbums = signal<Album[]>([]);
  favoriteArtists = signal<string[]>([]);
  savedPlaylists = signal(new Map<string, Playlist>());

  // use an in-memory set to quickly sort out favorites
  private favoriteSongsSet = computed(() =>
    new Set<string>(this.favoriteSongs().map(song => this.songKey(song))));
  private favoriteAlbumsSet = computed(() =>
    new Set<Album>(this.favoriteAlbums()));
  private favoriteArtistsSet = computed(() =>
    new Set<string>(this.favoriteArtists()));

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
    if (prefs.savedPlaylists) {
      // create map from serialized savedPlaylists object
      this.savedPlaylists.set(
        new Map<string, Playlist>(Object.entries(prefs.savedPlaylists))
      );
    }
  }

  savePreferences() {
    const prefs: Prefs = {};
    prefs.username = this.username();
    prefs.favoriteSongs = this.favoriteSongs();
    prefs.favoriteAlbums = this.favoriteAlbums();
    prefs.favoriteArtists = this.favoriteArtists();
    // since Map isn't serializable, convert to an object
    prefs.savedPlaylists = Object.fromEntries(this.savedPlaylists());

    localStorage.setItem("prefs", JSON.stringify(prefs));
  }

  private songKey(song: Song): string {
    return song.filename;
  }

  addSongToFavorites(song: Song) {
    if (this.isSongFavorited(song))
      return;
    this.favoriteSongs.set([... this.favoriteSongs(), song]);
    this.savePreferences();
  }

  removeSongFromFavorites(song: Song) {
    const keyToRemove = this.songKey(song);
    const nextFavorites = this.favoriteSongs().filter(saved => this.songKey(saved) !== keyToRemove);
    if (nextFavorites.length === this.favoriteSongs().length)
      return;
    this.favoriteSongs.set(nextFavorites);
    this.savePreferences();
  }

  addAlbumToFavorites(album: Album) {
    if (this.favoriteAlbums().find(a => a.artist === album.artist && a.name === album.name))
      return;
    this.favoriteAlbums.set([... this.favoriteAlbums(), album]);
    this.savePreferences();
  }

  removeAlbumFromFavorites(album: Album) {
    this.favoriteAlbums.set(
      [... this.favoriteAlbums()].filter(a => a.name !== album.name && a.artist !== album.artist)
    );
    this.savePreferences();
  }

  addArtistToFavorites(artistName: string) {
    if (this.favoriteArtists().find(a => a === artistName))
      return;
    this.favoriteArtists.set([... this.favoriteArtists(), artistName]);
  }

  removeArtistFromFavorites(artistName: string) {
    this.favoriteArtists.set(
      [... this.favoriteArtists()].filter(name => artistName !== name)
    );
  }

  isSongFavorited(song: Song): boolean {
    return this.favoriteSongsSet().has(this.songKey(song));
  }

  isAlbumFavorited(album: Album): boolean {
    return this.favoriteAlbumsSet().has(album);
  }

  isArtistFavorited(artistName: string): boolean {
    return this.favoriteArtistsSet().has(artistName);
  }

  addSongToPlaylist(song: Song, playlistName: string) {
    const currentPlaylists = this.savedPlaylists();
    let playlist = currentPlaylists.get(playlistName);
    if (playlist) {
      // append to songs of existing playlist
      playlist = {
        ... playlist,
        songs: [... playlist.songs, song]
      };
    } else {
      // if a playlist of given name doesn't exist, create it
      playlist = {
        title: playlistName,
        songs: [song]
      };
    }
    currentPlaylists.set(playlistName, playlist);
    this.savedPlaylists.set(currentPlaylists);
    this.savePreferences();
  }

  removeSongFromPlaylist(song: Song, playlistName: string) {
    const currentPlaylists = this.savedPlaylists();
    let playlist = currentPlaylists.get(playlistName);
    if (playlist) {
      playlist = {
        ... playlist,
        songs: playlist.songs.filter(s => song.title !== s.title || song.artist !== s.artist)
      };
      currentPlaylists.set(playlistName, playlist);
      this.savedPlaylists.set(currentPlaylists);
    }
  }

  removePlaylist(playlistName: string) {
    const currentPlaylists = this.savedPlaylists();
    if (currentPlaylists.delete(playlistName)) {
      this.savedPlaylists.set(currentPlaylists);
      this.savePreferences();
    }
  }

  // save preferences on dispose
  ngOnDestroy() {
    this.savePreferences();
  }
}
