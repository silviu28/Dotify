import { Component, inject, signal } from '@angular/core';
import { MusicService } from '../music-service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-search-result',
  imports: [],
  templateUrl: './search-result.html',
  styleUrl: './search-result.css',
})
export class SearchResult {
  musicService = inject(MusicService);
  activatedRoute = inject(ActivatedRoute);
  query = signal<string>('');

  constructor() {
    this.activatedRoute.params.subscribe(
      params => {
        const searchQuery = String(params['query']);
        this.query.set(decodeURIComponent(searchQuery));
        this.musicService.getByQuery(this.query())
        });
      }
  }