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
import { UserPreferencesService } from '../user-preferences-service';

type PlayerView = 'full' | 'compact' | 'bar';

@Component({
  selector: 'app-player',
  imports: [DatePipe],
  templateUrl: './player.html',
  styleUrl: './player.css',
})
export class Player implements AfterViewInit, OnDestroy {
  @ViewChild('playerWindow') playerWindow?: ElementRef<HTMLDivElement>;
  @ViewChild('visualizerCanvas') visualizerCanvas?: ElementRef<HTMLCanvasElement>;

  private musicService = inject(MusicService);
  private userPreferences = inject(UserPreferencesService);
  private audio = new Audio();
  private audioContext?: AudioContext;
  private analyser?: AnalyserNode;
  private mediaElementSource?: MediaElementAudioSourceNode;
  private frequencyData?: Uint8Array;
  private animationFrameId?: number;
  private idlePhase = 0;
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
  volume = signal<number>(100);
  showVisualizer = signal<boolean>(true);

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

  isSongFavorite = computed(() => {
    const current = this.song();
    return current ? this.userPreferences.isSongFavorited(current) : false;
  });

  audioFormat = computed(() => {
    const current = this.song();
    if (!current) {
      return '';
    }

    const extension = current.filename.split('.').pop();
    return (extension ?? 'mp3').toUpperCase();
  });

  songPosition = computed(() => {
    const current = this.song();
    const playlist = this.musicService.playlist();

    if (!current || !playlist.length) {
      return null;
    }

    const index = playlist.findIndex((item) => item.filename === current.filename);
    if (index === -1) {
      return null;
    }

    return { index: index + 1, total: playlist.length };
  });

  trackDisplayNumber = computed(() => {
    const position = this.songPosition();
    if (!position) {
      return '---';
    }

    return position.index.toString().padStart(3, '0');
  });

  constructor() {
    this.audio.crossOrigin = 'anonymous';
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
    this.stopVisualizerLoop();
    this.mediaElementSource?.disconnect();
    this.analyser?.disconnect();
    this.audioContext?.close();
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
      this.next();
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

  toggleFavorite(event?: Event) {
    event?.stopPropagation();
    const current = this.song();
    if (!current) {
      return;
    }

    if (this.userPreferences.isSongFavorited(current)) {
      this.userPreferences.removeSongFromFavorites(current);
    } else {
      this.userPreferences.addSongToFavorites(current);
    }
  }

  private playAudio() {
    void this.ensureAudioContext();
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

  seekVolume(event: Event) {
    console.log("update volume");
    const input = event.target as HTMLInputElement;
    const vol = parseInt(input.value);
    this.volume.set(vol);
    
    // volume takes 0-1
    this.audio.volume = vol / 100;
  }

  toggleVisualizer(event?: Event) {
    event?.stopPropagation();
    this.showVisualizer.update((value) => !value);
  }

  private async ensureAudioContext(): Promise<void> {
    if (typeof window === 'undefined' || typeof AudioContext === 'undefined') {
      return;
    }

    if (!this.audio.crossOrigin) {
      this.audio.crossOrigin = 'anonymous';
    }

    if (!this.audioContext) {
      this.audioContext = new AudioContext();
    }

    if (!this.analyser) {
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 512;
      this.analyser.smoothingTimeConstant = 0.85;
    }

    if (!this.mediaElementSource) {
      try {
        this.mediaElementSource = this.audioContext.createMediaElementSource(this.audio);
      } catch (error) {
        console.error('Unable to hook audio element into visualizer graph', error);
        return;
      }
      this.mediaElementSource.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      this.frequencyData = new Uint8Array(this.analyser.frequencyBinCount);
      this.startVisualizerLoop();
    }

    if (this.audioContext.state === 'suspended') {
      try {
        await this.audioContext.resume();
      } catch (error) {
        console.error('AudioContext resume blocked', error);
      }
    }
  }

  private startVisualizerLoop() {
    if (this.animationFrameId) {
      return;
    }

    const loop = () => {
      this.renderVisualizer();
      this.animationFrameId = requestAnimationFrame(loop);
    };

    this.animationFrameId = requestAnimationFrame(loop);
  }

  private stopVisualizerLoop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = undefined;
    }
  }

  private renderVisualizer() {
    const canvas = this.visualizerCanvas?.nativeElement;

    if (!canvas) {
      return;
    }

    const context = canvas.getContext('2d');
    if (!context) {
      return;
    }

    if (!this.showVisualizer()) {
      context.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const pixelRatio = typeof window === 'undefined' ? 1 : window.devicePixelRatio || 1;
    const displayWidth = Math.round(width * pixelRatio);
    const displayHeight = Math.round(height * pixelRatio);

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
      canvas.width = displayWidth;
      canvas.height = displayHeight;
    }

    context.save();
    context.scale(pixelRatio, pixelRatio);
    context.clearRect(0, 0, width, height);

    const baseline = height / 2;
    const maxAmplitude = height * 0.63;
    const segments = 80;

    type WaveLayer = {
      amplitude: number;
      speed: number;
      phase: number;
      stroke: string;
      glow: number;
      width: number;
    };

    const waveLayers: WaveLayer[] = [
      { amplitude: 0.85, speed: 1.45, phase: 0, stroke: 'rgba(255, 160, 255, 0.95)', glow: 24, width: 2.6 },
      { amplitude: 0.68, speed: 1.2, phase: 1.4, stroke: 'rgba(227, 132, 255, 0.8)', glow: 18, width: 2.1 },
      { amplitude: 0.55, speed: 1.75, phase: 2.6, stroke: 'rgba(187, 118, 255, 0.7)', glow: 14, width: 1.6 },
      { amplitude: 0.4, speed: 0.95, phase: 4.3, stroke: 'rgba(132, 96, 255, 0.55)', glow: 9, width: 1.3 },
    ];

    const computeValues = (layer: WaveLayer) => {
      const points: number[] = [];
      for (let i = 0; i < segments; i++) {
        const progress = i / (segments - 1);
        const baseWave = Math.sin(progress * Math.PI * 2 + this.idlePhase * layer.speed + layer.phase);
        const detailWave = Math.sin(progress * Math.PI * 6 + this.idlePhase * (layer.speed * 1.7) + layer.phase * 0.6);
        const drift = Math.sin(this.idlePhase * 0.2 + layer.phase + progress * Math.PI) * 0.15;
        const composite = Math.abs(baseWave * 0.65 + detailWave * 0.3 + drift * 0.2);
        points.push(Math.min(1.25, composite));
      }
      return points;
    };

    const layerValues = waveLayers.map((layer) => computeValues(layer));
    const areaValues = layerValues[0];

    this.idlePhase = (this.idlePhase + 0.055) % (Math.PI * 200);

    const backgroundGradient = context.createLinearGradient(0, 0, width, height);
    backgroundGradient.addColorStop(0, 'rgba(255, 120, 255, 0.15)');
    backgroundGradient.addColorStop(0.4, 'rgba(194, 92, 255, 0.12)');
    backgroundGradient.addColorStop(1, 'rgba(94, 53, 255, 0.08)');

    context.beginPath();
    context.moveTo(0, baseline);
    for (let i = 0; i < segments; i++) {
      const x = (i / (segments - 1)) * width;
      const offset = areaValues[i] * maxAmplitude;
      context.lineTo(x, baseline - offset);
    }
    for (let i = segments - 1; i >= 0; i--) {
      const x = (i / (segments - 1)) * width;
      const offset = areaValues[i] * maxAmplitude;
      context.lineTo(x, baseline + offset);
    }
    context.closePath();
    context.fillStyle = backgroundGradient;
    context.globalAlpha = 0.9;
    context.fill();
    context.globalAlpha = 1;

    const glowGradient = context.createLinearGradient(0, 0, width, height);
    glowGradient.addColorStop(0, 'rgba(255, 190, 255, 0.4)');
    glowGradient.addColorStop(1, 'rgba(147, 111, 255, 0.08)');

    context.beginPath();
    context.moveTo(0, baseline);
    for (let i = 0; i < segments; i++) {
      const x = (i / (segments - 1)) * width;
      const offset = areaValues[i] * maxAmplitude * 0.8;
      const y = baseline - offset;
      context.lineTo(x, y);
    }
    context.lineTo(width, baseline);
    context.closePath();
    context.fillStyle = glowGradient;
    context.globalAlpha = 0.5;
    context.fill();
    context.globalAlpha = 1;

    context.globalCompositeOperation = 'lighter';
    waveLayers.forEach((layer, layerIndex) => {
      const values = layerValues[layerIndex];
      const amplitude = maxAmplitude * layer.amplitude;
      context.lineJoin = 'round';
      context.lineCap = 'round';
      context.lineWidth = layer.width;
      context.strokeStyle = layer.stroke;
      context.shadowColor = layer.stroke;
      context.shadowBlur = layer.glow;

      const drawPath = (direction: 1 | -1) => {
        context.beginPath();
        for (let i = 0; i < segments; i++) {
          const x = (i / (segments - 1)) * width;
          const offset = values[i] * amplitude;
          const y = baseline + direction * offset;
          if (i === 0) {
            context.moveTo(x, y);
          } else {
            context.lineTo(x, y);
          }
        }
        context.stroke();
      };

      drawPath(-1);
      drawPath(1);
    });
    context.globalCompositeOperation = 'source-over';
    context.shadowBlur = 0;

    context.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    context.lineWidth = 1;
    context.setLineDash([5, 7]);
    context.beginPath();
    context.moveTo(0, baseline);
    context.lineTo(width, baseline);
    context.stroke();
    context.setLineDash([]);
    context.restore();
  }
}