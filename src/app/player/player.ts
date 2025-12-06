import { DatePipe } from '@angular/common';
import { Component, signal, inject, effect } from '@angular/core';
import { Song } from '../../types';
import { MusicService } from '../music-service';

@Component({
  selector: 'app-player',
  imports: [DatePipe],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player {
  private musicService = inject(MusicService);
  private audio = new Audio();

  isPlaying = signal<boolean>(false);
  songLength = signal<number>(0);
  playedTimestamp = signal<number>(0);
  playerShowing = signal<boolean>(true);
  
  // Instead of a local signal, we read from the service
  song = this.musicService.currentSong;

  constructor() {
    this.setupAudioListeners();

    // EFFECT: This runs automatically whenever 'musicService.currentSong' changes
    effect(() => {
      const currentSong = this.musicService.currentSong();
      if (currentSong) {
        // If a new song is selected, play it immediately
        this.playTrack(currentSong);
      }
    });
  }

  private setupAudioListeners() {
    // Update the timestamp as the song plays
    this.audio.addEventListener('timeupdate', () => {
      // audio.currentTime is in seconds, convert to ms for DatePipe
      this.playedTimestamp.set(this.audio.currentTime * 1000);
    });

    // Set the song duration once metadata is loaded
    this.audio.addEventListener('loadedmetadata', () => {
      this.songLength.set(this.audio.duration * 1000);
    });

    // Reset state when song ends
    this.audio.addEventListener('ended', () => {
      this.isPlaying.set(false);
      this.playedTimestamp.set(0);
      // TODO: Logic for auto-playing next song goes here
    });
  }

  // Method to start playing a specific track
  playTrack(newSong: Song) {
    // Note: We don't set this.song here anymore, the service handles the state
    
    const streamUrl = this.musicService.getSongStreamUrl(newSong.filename);
    this.audio.src = streamUrl;
    this.audio.load();
    this.playAudio();
  }

  // Toggle Play/Pause
  toggle() {
    if (this.isPlaying()) {
      this.pauseAudio();
    } else {
      // If a source is loaded, resume playback
      if (this.audio.src) {
        this.playAudio();
      }
    }
  }

  private playAudio() {
    this.audio.play();
    this.isPlaying.set(true);
  }

  private pauseAudio() {
    this.audio.pause();
    this.isPlaying.set(false);
  }

  toggleView() {
    this.playerShowing.set(!this.playerShowing());
  }

  // Handle seeking via the range input
  seek(event: Event) {
    const input = event.target as HTMLInputElement;
    const valueInSeconds = Number(input.value);
    
    this.audio.currentTime = valueInSeconds;
  }
}