import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-song-container',
  imports: [],
  templateUrl: './song-container.html',
  styleUrl: './song-container.css',
})
export class SongContainer {
  // uri for song thumbnail
  @Input() declare thumbnailSrc: string;
  // song's title
  @Input() declare title: string;
  // song's artist
  @Input() declare artist: string;
  // song's release year
  @Input() declare year: number;
  // song's album (if it's single then "single")
  @Input() declare album: string;
}
