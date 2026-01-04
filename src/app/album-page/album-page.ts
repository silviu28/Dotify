import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
export class AlbumPage implements OnInit {
  activatedRoute = inject(ActivatedRoute);
  musicService = inject(MusicService);

  album = computed(() =>
    this.musicService
      .albums()
      .find(album => album.name === this.albumName())
      ?? { songs: [], artist: "" });

  albumName = signal<string>("");

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      params => this.albumName.set(decodeURI(String(params["name"])))
    );
  }

  addToQueue(song: Song) {
    this.musicService.addToQueue(song);
  }
}
