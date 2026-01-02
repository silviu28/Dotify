import { Component, Input } from '@angular/core';
import { Album } from '../../types';

@Component({
  selector: 'app-album-container',
  imports: [],
  templateUrl: './album-container.html',
  styleUrl: './album-container.css',
})
export class AlbumContainer {
  @Input() declare album: Album;
}
