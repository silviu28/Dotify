import { Component, computed, inject, Input } from '@angular/core';
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
  private router = inject(Router);
  private userPrefsService = inject(UserPreferencesService);

  @Input() declare album: Album;

  isFavorited = computed(() =>
    this.userPrefsService.isAlbumFavorited(this.album));

  navigateToAlbum() {
    this.router.navigate(['/album', encodeURI(this.album.name!)]);
  }

  favoriteAlbum() {
    if (this.isFavorited()) {
      this.userPrefsService.removeAlbumFromFavorites(this.album);
    } else {
      this.userPrefsService.addAlbumToFavorites(this.album);
    }
  }
}
