import { DatePipe } from '@angular/common';
import {
  Component,
  signal,
  inject,
  effect,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { Song } from '../../types';
import { MusicService } from '../music-service';

@Component({
  selector: 'app-player',
  imports: [DatePipe],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player implements AfterViewInit, OnDestroy {
  private musicService = inject(MusicService);
  private audio = new Audio();
  @ViewChild('playerWrapper') playerWrapper?: ElementRef<HTMLElement>;

  isPlaying = signal<boolean>(false);
  songLength = signal<number>(0);
  playedTimestamp = signal<number>(0);
  playerShowing = signal<boolean>(true);
  playerPosition = signal<{ x: number; y: number }>({ x: 0, y: 0 });
  isDragging = signal<boolean>(false);
  private dragOffset = { x: 0, y: 0 };
  private dragInitialized = false;
  private readonly handlePointerMove = (event: PointerEvent) => {
    if (!this.isDragging()) {
      return;
    }
    this.playerPosition.set(this.computeNextPosition(event.clientX, event.clientY));
  };
  private readonly handlePointerUp = () => {
    this.isDragging.set(false);
  };
  
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

  next() {
    this.musicService.playNext();
  }

  prev() {
    this.musicService.playPrev();
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

  ngAfterViewInit() {
    if (typeof window === 'undefined') {
      return;
    }
    queueMicrotask(() => {
      this.setInitialPlayerPosition();
    });
    window.addEventListener('pointermove', this.handlePointerMove);
    window.addEventListener('pointerup', this.handlePointerUp);
  }

  ngOnDestroy() {
    if (typeof window === 'undefined') {
      return;
    }
    window.removeEventListener('pointermove', this.handlePointerMove);
    window.removeEventListener('pointerup', this.handlePointerUp);
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

  startDrag(event: PointerEvent) {
    if (this.shouldIgnoreDrag(event.target)) {
      return;
    }

    if (!this.playerWrapper) {
      return;
    }

    this.ensurePlayerPosition();
    const currentPosition = this.playerPosition();
    this.dragOffset = {
      x: event.clientX - currentPosition.x,
      y: event.clientY - currentPosition.y,
    };

    const wrapper = this.playerWrapper.nativeElement;
    wrapper.setPointerCapture?.(event.pointerId);
    this.isDragging.set(true);
    event.preventDefault();
  }

  private setInitialPlayerPosition() {
    if (this.dragInitialized || typeof window === 'undefined') {
      return;
    }

    this.dragInitialized = true;
    this.playerPosition.set(this.computeNextPosition(window.innerWidth / 2, window.innerHeight - 40, true));
  }

  private ensurePlayerPosition() {
    if (!this.dragInitialized) {
      this.setInitialPlayerPosition();
    }
  }

  private computeNextPosition(clientX: number, clientY: number, forceCenter = false) {
    if (typeof window === 'undefined') {
      return { x: clientX - this.dragOffset.x, y: clientY - this.dragOffset.y };
    }

    const wrapper = this.playerWrapper?.nativeElement;
    const width = wrapper?.offsetWidth ?? 600;
    const height = wrapper?.offsetHeight ?? 120;

    let nextX: number;
    let nextY: number;

    if (forceCenter) {
      nextX = window.innerWidth / 2 - width / 2;
      nextY = window.innerHeight - height - 20;
    } else {
      nextX = clientX - this.dragOffset.x;
      nextY = clientY - this.dragOffset.y;
    }

    // Keep the player inside the viewport bounds
    nextX = Math.min(Math.max(10, nextX), window.innerWidth - width - 10);
    nextY = Math.min(Math.max(10, nextY), window.innerHeight - height - 10);

    return { x: nextX, y: nextY };
  }

  private shouldIgnoreDrag(target: EventTarget | null): boolean {
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    return Boolean(target.closest('button, input, svg, path'));
  }
}