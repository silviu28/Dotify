import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Song } from '../../types';
import { MusicService } from '../music-service';
import { SongContainer } from "../song-container/song-container";

@Component({
  selector: 'app-album-page',
  imports: [SongContainer],
  templateUrl: './album-page.html',
  styleUrl: './album-page.css',
})
export class AlbumPage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private musicService = inject(MusicService);

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
