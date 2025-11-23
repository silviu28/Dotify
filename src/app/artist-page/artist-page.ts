import { Component, inject, signal } from '@angular/core';
import { MusicService } from '../music-service';
import { ActivatedRoute } from '@angular/router';
import { Song } from '../../types';
import { SongContainer } from "../song-container/song-container";

@Component({
  selector: 'app-artist-page',
  imports: [SongContainer],
  templateUrl: './artist-page.html',
  styleUrl: './artist-page.css',
})
export class ArtistPage {
  musicService = inject(MusicService);
  private activatedRoute = inject(ActivatedRoute);
  songs = signal<Song[]>([]);
  //TODO: add albums as well
  artist: string = '';

  constructor() {
    this.activatedRoute.params.subscribe(
      params => {
        const artistName = String(params['name']);
        this.artist = decodeURIComponent(artistName);
        this.musicService.getSongsByArtist(this.artist).subscribe(songs => {
          this.songs.set(songs);
        });
      }
    )
  }
}
