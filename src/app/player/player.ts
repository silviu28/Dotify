import { DatePipe } from '@angular/common';
import { Component, OnInit, signal } from '@angular/core';
import { Song } from '../../types';

@Component({
  selector: 'app-player',
  imports: [DatePipe],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player implements OnInit {
  // describes if the song is playing
  isPlaying = signal<boolean>(false);
  // how long the song is
  songLength = signal<number>(0);
  // how much of it has been played
  playedTimestamp = signal<number>(0);
  // the song that is playing
  song = signal<Song | null>(null);

  ngOnInit() {
    // ... retrieve song data
  }

  toggle() {
    this.isPlaying.set(!this.isPlaying());
  }
}
