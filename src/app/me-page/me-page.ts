import { Component, inject, OnDestroy, signal } from '@angular/core';
import { SongContainer } from "../song-container/song-container";
import { AlbumContainer } from "../album-container/album-container";
import { FormsModule } from '@angular/forms';
import { UserPreferencesService } from '../user-preferences-service';

@Component({
  selector: 'app-me-page',
  imports: [SongContainer, AlbumContainer, FormsModule],
  templateUrl: './me-page.html',
  styleUrl: './me-page.css',
})
export class MePage implements OnDestroy {
  private userPrefsService = inject(UserPreferencesService);

  favoritedSongs = this.userPrefsService.favoriteSongs;
  favoritedAlbums = this.userPrefsService.favoriteAlbums;
  name = this.userPrefsService.username;
  editModeEnabled = signal<boolean>(false);

  toggleEditMode() {
    this.editModeEnabled.set(!this.editModeEnabled());
    // when toggled off save to disk
    if (this.editModeEnabled()) {
      this.userPrefsService.savePreferences();
    }
  }

  ngOnDestroy() {
    localStorage.setItem(
      "favoriteSongs", JSON.stringify(this.favoritedSongs())
    );
    localStorage.setItem("name", this.name());
  }
}
