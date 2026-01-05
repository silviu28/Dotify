import { Component, Input } from '@angular/core';
import { Playlist } from '../../types';

@Component({
  selector: 'app-playlist-container',
  imports: [],
  templateUrl: './playlist-container.html',
  styleUrl: './playlist-container.css',
})
export class PlaylistContainer {
  @Input() declare playlist: Playlist;
}
