import { Component, inject, Input } from '@angular/core';
import { Playlist } from '../../types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-playlist-container',
  imports: [],
  templateUrl: './playlist-container.html',
  styleUrl: './playlist-container.css',
})
export class PlaylistContainer {
  private router = inject(Router);

  @Input() declare playlist: Playlist;

  navigateToPlaylist() {
    const encodedName = encodeURI(this.playlist.title);
    this.router.navigate(['/playlist', encodedName]);
  }
}
