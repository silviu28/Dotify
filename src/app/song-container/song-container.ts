import { Component, inject, Input } from '@angular/core';
import { base64 } from '../../types';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-song-container',
  imports: [],
  templateUrl: './song-container.html',
  styleUrl: './song-container.css',
})
export class SongContainer {
  private router = inject(Router);
  // song's title
  @Input() declare title: string;
  // song's artist
  @Input() declare artist: string;
  // song's release year
  @Input() declare year: number;
  // song's album (if it's single then "single")
  @Input() declare album: string;
  // song's album art (if it exists)
  @Input() albumArt?: base64;
  navigateToArtist() {
    const encodedName = encodeURIComponent(this.artist);
    this.router.navigate(['/artist', encodedName]);
  }
}
