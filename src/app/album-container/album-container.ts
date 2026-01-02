import { Component, inject, Input } from '@angular/core';
import { Album } from '../../types';
import { Router } from '@angular/router';

@Component({
  selector: 'app-album-container',
  imports: [],
  templateUrl: './album-container.html',
  styleUrl: './album-container.css',
})
export class AlbumContainer {
  router = inject(Router);

  @Input() declare album: Album;

  navigateToAlbum() {
    this.router.navigate(['/album', encodeURI(this.album.name!)]);
  }
}
