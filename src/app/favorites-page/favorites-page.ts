import { Component, computed, inject, model } from '@angular/core';
import { Song } from '../../types';
import { SongContainer } from '../song-container/song-container';
import { MusicService } from '../music-service';
import { UserPreferencesService } from '../user-preferences-service';

@Component({
  selector: 'app-favorites-page',
  imports: [SongContainer],
  templateUrl: './favorites-page.html',
  styleUrl: './favorites-page.css',
})
export class FavoritesPage {
  private musicService = inject(MusicService);
  private userPreferences = inject(UserPreferencesService);

  favoriteSongs = computed(() => this.userPreferences.favoriteSongs());
  searchQuery = model<string>('');
  filteredSongs = computed(() => {
    const query = this.searchQuery().trim().toLowerCase();
    const songs = this.favoriteSongs();

    if (!query) {
      return songs;
    }

    return songs.filter(song => {
      const haystack = `${song.title} ${song.artist} ${song.album}`.toLowerCase();
      return haystack.includes(query);
    });
  });

  play(song: Song) {
    this.musicService.playSong(song);
  }
}
