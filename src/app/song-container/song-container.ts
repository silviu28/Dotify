import { Component, computed, inject, Input, signal } from '@angular/core';
import { Song } from '../../types';
import { Router } from '@angular/router';
import { MusicService } from '../music-service';
import { UserPreferencesService } from '../user-preferences-service';

@Component({
  selector: 'app-song-container',
  imports: [],
  templateUrl: './song-container.html',
  styleUrl: './song-container.css',
})
export class SongContainer {
  private router = inject(Router);
  private musicService = inject(MusicService);
  private userPrefsService = inject(UserPreferencesService);

  @Input() song!: Song; 

  isMenuOpen = signal(false);
  isFavorited = computed(() =>
    this.userPrefsService.isSongFavorited(this.song));

  navigateToArtist(event: Event) {
    event.stopPropagation();
    const encodedName = encodeURIComponent(this.song.artist);
    this.router.navigate(['/artist', encodedName]);
  }

  favoriteSong(event: Event) {
    event.stopPropagation(); // OPRIRE PLAY CÂND DAI LIKE
    if (this.isFavorited()) {
      this.userPrefsService.removeSongFromFavorites(this.song);
    } else {
      this.userPrefsService.addSongToFavorites(this.song);
    }
  }

  toggleMenu(event: Event) {
    event.stopPropagation(); 
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  onAddToQueue(event: Event) {
    event.stopPropagation();
    this.musicService.addToQueue(this.song);
    this.isMenuOpen.set(false);
  }

  onPlayNext(event: Event) {
    event.stopPropagation();
    this.musicService.playNextInQueue(this.song);
    this.isMenuOpen.set(false);
  }
}