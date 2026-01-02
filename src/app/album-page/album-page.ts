import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Album, Song } from '../../types';
import { MusicService } from '../music-service';
import { SongContainer } from "../song-container/song-container";

@Component({
  selector: 'app-album-page',
  imports: [SongContainer],
  templateUrl: './album-page.html',
  styleUrl: './album-page.css',
})
export class AlbumPage {
  activatedRoute = inject(ActivatedRoute);
  musicService = inject(MusicService);

  album = signal<Album>({
    songs: [],
    artist: ''
  });

  constructor() {
    this.activatedRoute.params.subscribe(
      params => {
        const albumName = decodeURI(String(params['name']));
        this.album.set(
          this.musicService
            .albums()
            .find(album => album.name === albumName)
            ?? { songs: [], artist: "" }
        );
      }
    );
  }

  addToQueue(song: Song) {
    this.musicService.addToQueue(song);
  }
}
