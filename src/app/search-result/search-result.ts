import { Component, computed, inject, signal } from '@angular/core';
import { MusicService } from '../music-service';
import { ActivatedRoute } from '@angular/router';
import { SongContainer } from '../song-container/song-container';
import { AlbumContainer } from '../album-container/album-container';
import { TextPill } from '../text-pill/text-pill';

@Component({
  selector: 'app-search-result',
  imports: [SongContainer, AlbumContainer, TextPill],
  templateUrl: './search-result.html',
  styleUrl: './search-result.css',
})
export class SearchResult {
  musicService = inject(MusicService);
  activatedRoute = inject(ActivatedRoute);
  query = signal<string>('');

  resultSongs = computed(() =>
    this.musicService
      .songs()
      .filter(song =>
        song.title
          .toLowerCase()
          .includes(this.query().trim().toLowerCase()))
  );

  // NOTE: you would usually do filtering/paging from the backend
  // but for a frontend app it's good enough
  resultAlbums = computed(() =>
    this.musicService
      .albums()
      .filter(album =>
        album.name
          ?.toLowerCase()
          .includes(this.query().trim().toLowerCase()))
  );

  resultArtistNames = computed(() =>
    this.musicService
      .artistNames()
      .filter(artistName =>
        artistName
          .toLowerCase()
          .includes(this.query().trim().toLowerCase()))
  );

  constructor() {
    this.activatedRoute.params.subscribe(
      params => {
        const searchQuery = String(params['query']);
        this.query.set(decodeURIComponent(searchQuery));
        this.musicService.getByQuery(this.query());
      });
  }
}