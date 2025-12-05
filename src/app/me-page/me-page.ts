import { Component, OnDestroy, signal } from '@angular/core';
import { Album, Song } from '../../types';
import { SongContainer } from "../song-container/song-container";
import { AlbumContainer } from "../album-container/album-container";

@Component({
  selector: 'app-me-page',
  imports: [SongContainer, AlbumContainer],
  templateUrl: './me-page.html',
  styleUrl: './me-page.css',
})
export class MePage implements OnDestroy {
  favoritedSongs = signal<Song[]>([]);
  favoritedAlbums = signal<Album[]>([]);
  name = signal<string>("user");

  ngOnDestroy() {
    localStorage.setItem(
      "favoriteSongs", JSON.stringify(this.favoritedSongs())
    );
    localStorage.setItem("name", this.name());
  }
}
