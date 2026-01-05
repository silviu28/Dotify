import { Component, inject, OnDestroy, signal } from '@angular/core';
import { SongContainer } from "../song-container/song-container";
import { AlbumContainer } from "../album-container/album-container";
import { FormsModule } from '@angular/forms';
import { UserPreferencesService } from '../user-preferences-service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-me-page',
  imports: [SongContainer, AlbumContainer, FormsModule],
  templateUrl: './me-page.html',
  styleUrl: './me-page.css',
})
export class MePage implements OnDestroy {
  private userPrefsService = inject(UserPreferencesService);
  private router = inject(Router);

  favoritedSongs = this.userPrefsService.favoriteSongs;
  favoritedAlbums = this.userPrefsService.favoriteAlbums;
  favoritedArtists = this.userPrefsService.favoriteArtists;


  name = this.userPrefsService.username;
  editModeEnabled = signal<boolean>(false);

  toggleEditMode() {
    this.editModeEnabled.set(!this.editModeEnabled());
    // when toggled off save to disk
    if (this.editModeEnabled()) {
      this.userPrefsService.savePreferences();
    }
  }

  navigateToArtist(artistName: string) {
    this.router.navigate(['/artist', artistName]);
  }

  ngOnDestroy() {
    localStorage.setItem(
      "favoriteSongs", JSON.stringify(this.favoritedSongs())
    );
    localStorage.setItem("name", this.name());
  }
}
