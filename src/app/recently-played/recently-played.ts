import { Component, inject, OnInit, signal } from '@angular/core';
import { MusicService } from '../music-service';
import { Song } from '../../types';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-recently-played',
  imports: [],
  templateUrl: './recently-played.html',
  styleUrl: './recently-played.css',
})
export class RecentlyPlayed implements OnInit {
  private musicService = inject(MusicService);
  private onPlaySub?: Subscription;

  recentlyPlayedSongs = signal<Song[]>([]);

  ngOnInit() {
    this.onPlaySub = this.musicService.onPlay.subscribe({next: song => {
      console.log("yep, i'm updating", this.recentlyPlayedSongs());
      this.recentlyPlayedSongs.update(old => [song, ... old]);
    }});
  }
}
