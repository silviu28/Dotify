import { Component, inject } from '@angular/core';
import { MusicService } from '../music-service';
import { SongPreview } from '../song-preview/song-preview';

@Component({
  selector: 'app-recently-played',
  imports: [SongPreview],
  templateUrl: './recently-played.html',
  styleUrl: './recently-played.css',
})
export class RecentlyPlayed {
  private musicService = inject(MusicService);

  recentlyPlayedSongs = this.musicService.recentlyPlayed;
}
