import { computed, Injectable, OnDestroy, signal } from '@angular/core';
import { Album, EqualizerBand, EqualizerSettings, Playlist, Prefs, Song } from '../types';

const DEFAULT_EQUALIZER_BANDS: EqualizerBand[] = [
  { label: "60 Hz", frequency: 60, value: 0 },
  { label: "170 Hz", frequency: 170, value: 0 },
  { label: "310 Hz", frequency: 310, value: 0 },
  { label: "600 Hz", frequency: 600, value: 0 },
  { label: "1 kHz", frequency: 1000, value: 0 },
  { label: "3 kHz", frequency: 3000, value: 0 },
  { label: "6 kHz", frequency: 6000, value: 0 },
  { label: "12 kHz", frequency: 12000, value: 0 }
];

const cloneBands = (bands: EqualizerBand[] = []) =>
  bands.map(band => ({ ... band }));

const createDefaultEqualizer = (): EqualizerSettings => ({
  enabled: true,
  preset: "Balanced",
  preamp: 0,
  bands: cloneBands(DEFAULT_EQUALIZER_BANDS)
});

@Injectable({
  providedIn: 'root',
})
export class UserPreferencesService implements OnDestroy {
  username = signal<string>("user");
  favoriteSongs = signal<Song[]>([]);
  favoriteAlbums = signal<Album[]>([]);
  favoriteArtists = signal<string[]>([]);
  savedPlaylists = signal(new Map<string, Playlist>());
  equalizerSettings = signal<EqualizerSettings>(createDefaultEqualizer());

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
    this.loadFrom(prefs);
  }

  getAll(): Prefs {
    return {
      username: this.username(),
      favoriteSongs: this.favoriteSongs(),
      favoriteAlbums: this.favoriteAlbums(),
      favoriteArtists: this.favoriteArtists(),
      savedPlaylists: Object.fromEntries(this.savedPlaylists()),
      equalizer: this.equalizerSettings(),
    };
  }

  loadFrom(prefs: Prefs, save = false) {
    console.log("loading from", prefs);
    try {
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
      this.equalizerSettings.set(this.mergeEqualizerSettings(prefs.equalizer));
      
      if (save) this.savePreferences();
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.error("Unable to load from this file.", e);
      }
    }
  }

  private mergeEqualizerSettings(settings?: EqualizerSettings): EqualizerSettings {
    if (!settings) {
      return createDefaultEqualizer();
    }

    const incomingBands = new Map(
      (settings.bands ?? []).map<[string, EqualizerBand]>(band => [band.label, band])
    );

    return {
      enabled: settings.enabled ?? true,
      preset: settings.preset ?? "Balanced",
      preamp: settings.preamp ?? 0,
      bands: cloneBands(DEFAULT_EQUALIZER_BANDS).map(band => {
        const override = incomingBands.get(band.label);
        return {
          ... band,
          value: override?.value ?? band.value,
        };
      })
    };
  }

  setEqualizerSettings(next: EqualizerSettings) {
    this.equalizerSettings.set({
      ... next,
      bands: cloneBands(next.bands)
    });
    this.savePreferences();
  }

  resetEqualizerSettings() {
    this.setEqualizerSettings(createDefaultEqualizer());
  }

  savePreferences() {
    const prefs: Prefs = {};
    prefs.username = this.username();
    prefs.favoriteSongs = this.favoriteSongs();
    prefs.favoriteAlbums = this.favoriteAlbums();
    prefs.favoriteArtists = this.favoriteArtists();
    // since Map isn't serializable, convert to an object
    prefs.savedPlaylists = Object.fromEntries(this.savedPlaylists());
    prefs.equalizer = this.equalizerSettings();

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
    const playlist = currentPlaylists.get(playlistName)!;
    if (playlist) {
      const updatedSongs = playlist.songs
        .filter(s => song.title !== s.title || song.artist !== s.artist);

      if (updatedSongs.length === playlist.songs.length) {
        return;
      }

      const updatedPlaylists = new Map(currentPlaylists);
      updatedPlaylists.set(playlistName, {
        ...playlist,
        songs: updatedSongs
      });

      this.savedPlaylists.set(updatedPlaylists);
      this.savePreferences();
    }
  }

  removePlaylist(playlistName: string) {
    const currentPlaylists = this.savedPlaylists();
    const updatedPlaylists = new Map(currentPlaylists);
    
    if (updatedPlaylists.delete(playlistName)) {
      this.savedPlaylists.set(updatedPlaylists);
      this.savePreferences();
    }
  }

  // save preferences on dispose
  ngOnDestroy() {
    this.savePreferences();
  }
}
