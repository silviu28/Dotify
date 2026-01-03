import { Component, inject, Input } from '@angular/core';
import { Album } from '../../types';
import { Router } from '@angular/router';
import { UserPreferencesService } from '../user-preferences-service';

@Component({
  selector: 'app-album-container',
  imports: [],
  templateUrl: './album-container.html',
  styleUrl: './album-container.css',
})
export class AlbumContainer {
  router = inject(Router);
  userPrefsService = inject(UserPreferencesService);

  @Input() declare album: Album;

  navigateToAlbum() {
    this.router.navigate(['/album', encodeURI(this.album.name!)]);
  }

  favoriteAlbum(event: Event) {
    event.stopPropagation();
    this.userPrefsService.addAlbumToFavorites(this.album);
  } 
}
