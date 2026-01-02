import { Component, inject, signal } from '@angular/core';
import { MusicService } from '../music-service';
import { ActivatedRoute } from '@angular/router';
import { Album, DeezerResponse, Song } from '../../types';
import { SongContainer } from "../song-container/song-container";
import { AlbumPage } from "../album-page/album-page";
import { DecimalPipe } from '@angular/common';
import { AlbumContainer } from "../album-container/album-container";

@Component({
  selector: 'app-artist-page',
  imports: [SongContainer, AlbumPage, DecimalPipe, AlbumContainer],
  templateUrl: './artist-page.html',
  styleUrl: './artist-page.css',
})
export class ArtistPage {
  musicService = inject(MusicService);
  private activatedRoute = inject(ActivatedRoute);
  songs = signal<Song[]>([]);
  //TODO: add albums as well
  albums = signal<Album[]>([]);
  artist = '';
  artistId = 0;
  pictureSrc = signal<string>("");
  fanCount = signal<number>(0);
  
  constructor() {
    this.activatedRoute.params.subscribe(
      params => {
        const artistName = String(params['name']);
        this.artist = decodeURIComponent(artistName);
        this.musicService.getSongsByArtist(this.artist).subscribe(songs => {
          this.songs.set(songs);

          const artistId = songs[0]?.deezer_artist_id;
          if (artistId) {
            this.musicService.getArtistData(artistId).subscribe((data: DeezerResponse) => {
              console.log("your sweet artist kind sire", data);
              if (!("message" in data) && !("code" in data)) {
                console.log(data);
                const { picture, nb_fan } = data;
                this.pictureSrc.set(picture);
                this.fanCount.set(nb_fan);
              }
            });
          }
        });
      }
    );

    this.albums.set(
      this.musicService
        .albums()
        .filter(album => album.artist === this.artist)
    );
  }
}
