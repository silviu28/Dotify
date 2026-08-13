import { Component, computed, inject, OnDestroy, signal } from '@angular/core';
import { SongContainer } from '../song-container/song-container';
import { AlbumContainer } from '../album-container/album-container';
import { FormsModule } from '@angular/forms';
import { UserPreferencesService } from '../user-preferences-service';
import { Router } from '@angular/router';
import { PlaylistContainer } from '../playlist-container/playlist-container';
import { Prefs } from '../../types';
import { TextPill } from '../text-pill/text-pill';

@Component({
  selector: 'app-me-page',
  imports: [SongContainer, AlbumContainer, FormsModule, PlaylistContainer, TextPill],
  templateUrl: './me-page.html',
  styleUrl: './me-page.css',
})
export class MePage implements OnDestroy {
  private userPrefsService = inject(UserPreferencesService);
  private router = inject(Router);

  favoritedSongs = this.userPrefsService.favoriteSongs;
  favoritedAlbums = this.userPrefsService.favoriteAlbums;
  favoritedArtists = this.userPrefsService.favoriteArtists;
  savedPlaylists = computed(() =>
    Array.from(this.userPrefsService.savedPlaylists()));

  name = this.userPrefsService.username;
  editModeEnabled = signal<boolean>(false);

  toggleEditMode() {
    if (this.editModeEnabled()) {
      this.userPrefsService.savePreferences();
    }
    // when toggled off save to disk
    this.editModeEnabled.set(!this.editModeEnabled());
  }

  navigateToArtist(artistName: string) {
    this.router.navigate(['/artist', artistName]);
  }

  ngOnDestroy() {
    if (!window.electronAPI) {
      localStorage.setItem(
        'favoriteSongs', JSON.stringify(this.favoritedSongs())
      );
      localStorage.setItem('name', this.name());
    }
  }

  loadPreferencesFromFile() {
    // create a file type input component outside of the DOM to handle the dialog
    const _input = document.createElement('input');
    _input.type = 'file';
    _input.accept = '.json';
    _input.onchange = (event: Event) => {
      const target = event.target as HTMLInputElement;
      const file = target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const content = e.target?.result as string;
            const prefs: Prefs = JSON.parse(content);
            // also save to not have everything blank next time
            this.userPrefsService.loadFrom(prefs, true);
          } catch (e: unknown) {
            if (e instanceof Error) {
              console.error('Unable to load', e);
            }
          }
        };
        reader.readAsText(file);
      }
    };

    _input.click();
  }

  savePreferencesToFile() {
    const prefs = this.userPrefsService.getAll();
    const serializedPrefs = JSON.stringify(prefs, null, 2);
    const blob = new Blob([serializedPrefs], { type: 'application/json' });

    // just like we did for the dialog, we create a DOM-detached anchor to send a download command
    const _url = URL.createObjectURL(blob);
    const _a = document.createElement('a');
    _a.href = _url;
    _a.download = 'preferences.json';
    // mock a click of the anchor
    _a.click();

    URL.revokeObjectURL(_url);
  }

  removeArtistFromFavorites(artistName: string) {
    this.userPrefsService.removeArtistFromFavorites(artistName);
  }
}
