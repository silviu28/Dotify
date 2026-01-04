import { DatePipe } from '@angular/common';
import {
  Component,
  signal,
  inject,
  effect,
  computed,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener,
  untracked,
} from '@angular/core';
import { Song } from '../../types';
import { MusicService } from '../music-service';

type PlayerView = 'full' | 'compact' | 'bar';

@Component({
  selector: 'app-player',
  imports: [DatePipe],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player implements AfterViewInit, OnDestroy {
  @ViewChild('playerWindow') playerWindow?: ElementRef<HTMLDivElement>;

  private musicService = inject(MusicService);
  private audio = new Audio();
  private dragOffset = { x: 0, y: 0 };
  private readonly dragMargin = 16;
  private readonly pointerMoveListener = (event: PointerEvent) =>
    this.handlePointerMove(event);
  private readonly pointerUpListener = () => this.endDrag();

  isPlaying = signal<boolean>(false);
  songLength = signal<number>(0);
  playedTimestamp = signal<number>(0);
  playerPosition = signal<{ x: number; y: number }>({ x: 20, y: 20 });
  isDragging = signal<boolean>(false);
  playerView = signal<PlayerView>('full');
  private lastExpandedView: PlayerView = 'full';
  private forcedBarByEmptyQueue = false;
  
  // Instead of a local signal, we read from the service
  song = this.musicService.currentSong;
  albumArtUrl = computed(() => {
    const art = this.song()?.albumArt;
    if (!art) {
      return null;
    }

    return art.startsWith('data:') ? art : `data:image/jpeg;base64,${art}`;
  });

  constructor() {
    this.setupAudioListeners();
    this.seedInitialPosition();
    this.setupPlaybackEffect();
    this.setupViewGuardEffect();
  }

  ngAfterViewInit() {
    this.centerPlayer();
  }

  ngOnDestroy() {
    this.detachPointerListeners();
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

  private playAudio() {
    this.audio.play();
    this.isPlaying.set(true);
  }

  private pauseAudio() {
    this.audio.pause();
    this.isPlaying.set(false);
  }

  // Handle seeking via the range input
  seek(event: Event) {
    const input = event.target as HTMLInputElement;
    const valueInSeconds = Number(input.value);
    
    this.audio.currentTime = valueInSeconds;
  }

  startDrag(event: PointerEvent) {
    if (typeof window === 'undefined') {
      return;
    }

    const target = event.target as HTMLElement | null;
    if (target?.closest('button, input, svg')) {
      return;
    }

    event.preventDefault();
    this.isDragging.set(true);

    const wrapperRect = this.playerWindow?.nativeElement.getBoundingClientRect();
    const offsetX = event.clientX - (wrapperRect?.left ?? this.playerPosition().x);
    const offsetY = event.clientY - (wrapperRect?.top ?? this.playerPosition().y);
    this.dragOffset = { x: offsetX, y: offsetY };

    this.detachPointerListeners();
    window.addEventListener('pointermove', this.pointerMoveListener);
    window.addEventListener('pointerup', this.pointerUpListener);
    window.addEventListener('pointercancel', this.pointerUpListener);
  }

  private handlePointerMove(event: PointerEvent) {
    if (!this.isDragging()) {
      return;
    }

    const desiredX = event.clientX - this.dragOffset.x;
    const desiredY = event.clientY - this.dragOffset.y;
    this.playerPosition.set(this.getClampedPosition(desiredX, desiredY));
  }

  private endDrag() {
    if (!this.isDragging()) {
      return;
    }

    this.isDragging.set(false);
    this.detachPointerListeners();
  }

  private detachPointerListeners() {
    if (typeof window === 'undefined') {
      return;
    }

    window.removeEventListener('pointermove', this.pointerMoveListener);
    window.removeEventListener('pointerup', this.pointerUpListener);
    window.removeEventListener('pointercancel', this.pointerUpListener);
  }

  @HostListener('window:resize')
  onWindowResize() {
    const { x, y } = this.playerPosition();
    this.playerPosition.set(this.getClampedPosition(x, y));
  }

  private centerPlayer() {
    if (typeof window === 'undefined') {
      return;
    }

    const { width, height } = this.getWrapperDimensions();
    const centeredX = (window.innerWidth - width) / 2;
    const bottomOffset = window.innerHeight - height - 20;
    this.playerPosition.set(this.getClampedPosition(centeredX, bottomOffset));
  }

  private getClampedPosition(x: number, y: number) {
    if (typeof window === 'undefined') {
      return { x, y };
    }

    const { width, height } = this.getWrapperDimensions();
    const maxX = window.innerWidth - width - this.dragMargin;
    const maxY = window.innerHeight - height - this.dragMargin;

    return {
      x: Math.min(Math.max(this.dragMargin, x), Math.max(this.dragMargin, maxX)),
      y: Math.min(Math.max(this.dragMargin, y), Math.max(this.dragMargin, maxY)),
    };
  }

  private getWrapperDimensions() {
    const element = this.playerWindow?.nativeElement;
    if (element) {
      return { width: element.offsetWidth, height: element.offsetHeight };
    }

    return this.getFallbackDimensions();
  }

  private getFallbackDimensions() {
    switch (this.playerView()) {
      case 'compact':
        return { width: 280, height: 170 };
      case 'bar':
        return { width: 220, height: 90 };
      default:
        return { width: 350, height: 260 };
    }
  }

  private seedInitialPosition() {
    if (typeof window === 'undefined') {
      return;
    }

    const { width: approxWidth, height: approxHeight } = this.getFallbackDimensions();
    const x = (window.innerWidth - approxWidth) / 2;
    const y = window.innerHeight - approxHeight - 20;
    this.playerPosition.set(this.getClampedPosition(x, y));
  }

  setView(view: PlayerView) {
    if (view !== 'bar') {
      this.lastExpandedView = view;
    }

    if (this.playerView() === view) {
      return;
    }

    this.playerView.set(view);
    this.reclampPosition();
  }

  restoreExpandedView(event?: Event) {
    event?.stopPropagation();
    const targetView = this.lastExpandedView === 'bar' ? 'full' : this.lastExpandedView;
    this.setView(targetView);
  }

  cycleView(event?: Event) {
    event?.stopPropagation();
    const order: PlayerView[] = ['full', 'compact', 'bar'];
    const currentIndex = order.indexOf(this.playerView());
    let nextIndex = (currentIndex + 1) % order.length;
    const hasSong = Boolean(this.song());

    if (!hasSong) {
      nextIndex = order.indexOf('bar');
    }

    this.setView(order[nextIndex]);
  }

  private reclampPosition() {
    const { x, y } = this.playerPosition();
    this.playerPosition.set(this.getClampedPosition(x, y));
  }

  private setupPlaybackEffect() {
    effect(() => {
      const currentSong = this.musicService.currentSong();
      if (currentSong) {
        this.playTrack(currentSong);
      }
    });
  }

  private setupViewGuardEffect() {
    effect(() => {
      const hasSong = Boolean(this.musicService.currentSong());
      untracked(() => {
        const currentView = this.playerView();
        if (!hasSong && currentView !== 'bar') {
          this.lastExpandedView = currentView;
          this.playerView.set('bar');
          this.reclampPosition();
          this.forcedBarByEmptyQueue = true;
          return;
        }

        if (hasSong && this.forcedBarByEmptyQueue && currentView === 'bar') {
          this.forcedBarByEmptyQueue = false;
          const targetView = this.lastExpandedView === 'bar' ? 'full' : this.lastExpandedView;
          this.playerView.set(targetView);
          this.reclampPosition();
        }
      });
    });
  }
}