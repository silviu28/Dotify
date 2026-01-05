import { Component, inject, input } from '@angular/core';
import { Song } from '../../types';
import { MusicService } from '../music-service';

@Component({
  selector: 'app-song-preview',
  imports: [],
  templateUrl: './song-preview.html',
  styleUrl: './song-preview.css',
})
export class SongPreview {
  song = input.required<Song>();
  musicService = inject(MusicService);

  playSong() {
    this.musicService.playSong(this.song()!);
  }
}
