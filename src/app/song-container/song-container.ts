import { Component, computed, inject, Input, model, signal } from '@angular/core';
import { Song } from '../../types';
import { Router } from '@angular/router';
import { MusicService } from '../music-service';
import { UserPreferencesService } from '../user-preferences-service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-song-container',
  imports: [FormsModule],
  templateUrl: './song-container.html',
  styleUrl: './song-container.css',
})
export class SongContainer {
  private router = inject(Router);
  private musicService = inject(MusicService);
  private userPrefsService = inject(UserPreferencesService);

  @Input() declare song: Song;
  // pass playlist name if in the playlist view
  @Input() playlistName = "";

  isMenuOpen = signal(false);
  isFavorited = computed(() =>
    this.userPrefsService.isSongFavorited(this.song));
  // don't load all playlists unless adding to playlist
  availablePlaylists = computed(() => {
    if (!this.addingToPlaylist()) return;

    return Array.from(this.userPrefsService.savedPlaylists());
  });
  selectedPlaylistOption = model<string>("New...");
  newPlaylistName = model<string>("");

  addingToPlaylist = signal<boolean>(false);

  navigateToArtist() {
    const encodedName = encodeURIComponent(this.song.artist);
    this.router.navigate(['/artist', encodedName]);
  }

  navigateToAlbum() {
    const encodedName = encodeURI(this.song.album);
    this.router.navigate(['/album', encodedName]);
  }

  favoriteSong() {
    if (this.isFavorited()) {
      this.userPrefsService.removeSongFromFavorites(this.song);
    } else {
      this.userPrefsService.addSongToFavorites(this.song);
    }
  }

  toggleMenu() {
    this.isMenuOpen.set(!this.isMenuOpen());
  }

  onAddToQueue() {
    this.musicService.addToQueue(this.song);
    this.isMenuOpen.set(false);
  }

  onPlayNext() {
    this.musicService.playNextInQueue(this.song);
    this.isMenuOpen.set(false);
  }

  toggleAddingToPlaylist() {
    this.addingToPlaylist.set(!this.addingToPlaylist());
  }

  addToPlaylist() {
    console.log("add to ", this.newPlaylistName());
    if (this.newPlaylistName()) {
      this.userPrefsService
        .addSongToPlaylist(this.song, this.newPlaylistName());
    } else {
      this.userPrefsService
        .addSongToPlaylist(this.song, this.selectedPlaylistOption());
    }
    
    this.selectedPlaylistOption.set("New...");
    this.newPlaylistName.set("");
  }

  removeFromPlaylist() {
    this.userPrefsService
      .removeSongFromPlaylist(this.song, this.playlistName);
  }

  play(song: Song) {
    this.musicService.playSong(song);
  }
}