import { Component, inject, Input, signal } from '@angular/core';
import { Song, base64 } from '../../types';
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

  // --- INPUTURI VECHI (Păstrate pentru compatibilitate) ---
  @Input() declare title: string;
  @Input() declare artist: string;
  @Input() declare year: number;
  @Input() declare album: string;
  @Input() albumArt?: base64;

  // --- INPUT NOU ---
  @Input() song!: Song; 

  isMenuOpen = signal(false);

  navigateToArtist(event: Event) {
    event.stopPropagation();
    const encodedName = encodeURIComponent(this.artist);
    this.router.navigate(['/artist', encodedName]);
  }

  // --- MODIFICARE: Am adăugat event pentru stopPropagation ---
  favoriteSong(event: Event) {
    event.stopPropagation(); // OPRIRE PLAY CÂND DAI LIKE
    
    const currentFavoriteSongs = [... this.userPrefsService.favoriteSongs()];
    currentFavoriteSongs.push(this.song);
    this.userPrefsService.favoriteSongs.set(currentFavoriteSongs);
    this.userPrefsService.savePreferences();
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