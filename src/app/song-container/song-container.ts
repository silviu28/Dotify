import { Component, inject, Input } from '@angular/core';
import { Song } from '../../types';
import { Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences-service';

@Component({
  selector: 'app-song-container',
  imports: [],
  templateUrl: './song-container.html',
  styleUrl: './song-container.css',
})
export class SongContainer {
  private router = inject(Router);
  private userPrefsService = inject(UserPreferencesService);

  @Input() declare song: Song;

  navigateToArtist() {
    const encodedName = encodeURIComponent(this.song.artist);
    this.router.navigate(['/artist', encodedName]);
  }

  favoriteSong() {
    const currentFavoriteSongs = [... this.userPrefsService.favoriteSongs()];
    currentFavoriteSongs.push(this.song);
    this.userPrefsService.favoriteSongs.set(currentFavoriteSongs);
    this.userPrefsService.savePreferences();
  }

}
