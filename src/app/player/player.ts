import { DatePipe } from '@angular/common';
import { Component, signal } from '@angular/core';
import { Song } from '../../types';

@Component({
  selector: 'app-player',
  imports: [DatePipe],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player {
  // describes if the song is playing
  isPlaying = signal<boolean>(false);
  // how long the song is
  songLength = signal<number>(0);
  // how much of it has been played
  playedTimestamp = signal<number>(0);
  // the song that is playing
  song = signal<Song | null>(null);
  // show or hide the player
  playerShowing = signal<boolean>(true);

  toggle() {
    this.isPlaying.set(!this.isPlaying());
  }

  toggleView() {
    this.playerShowing.set(!this.playerShowing());
  }
}
