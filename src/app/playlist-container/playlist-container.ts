import { Component, inject, Input, signal } from '@angular/core';
import { Playlist } from '../../types';
import { Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences-service';

@Component({
  selector: 'app-playlist-container',
  imports: [],
  templateUrl: './playlist-container.html',
  styleUrl: './playlist-container.css',
})
export class PlaylistContainer {
  private router = inject(Router);
  private userPrefsService = inject(UserPreferencesService);

  @Input() declare playlist: Playlist;

  isMenuOpen = signal<boolean>(false);
  isRemovingPlaylist = signal<boolean>(false);

  navigateToPlaylist() {
    const encodedName = encodeURI(this.playlist.title);
    this.router.navigate(['/playlist', encodedName]);
  }

  toggleMenu(event: Event) {
    event.stopPropagation();
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  removePlaylist(event: Event) {
    event.stopPropagation();
    this.userPrefsService.removePlaylist(this.playlist.title);
    this.isRemovingPlaylist.set(false);
  }

  toggleRemovingPlaylist(event: Event) {
    event.stopPropagation();
    this.isRemovingPlaylist.set(!this.isRemovingPlaylist());
  }
}
