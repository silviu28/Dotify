import { Component, inject, Input, OnInit, signal, OnDestroy } from '@angular/core';
import { MusicService } from '../music-service';
import { Song } from '../../types';

@Component({
  selector: 'app-image-conveyor-belt',
  imports: [],
  templateUrl: './image-conveyor-belt.html',
  styleUrl: './image-conveyor-belt.css',
})
export class ImageConveyorBelt implements OnInit, OnDestroy {
  @Input() reversed = false;

  private musicService = inject(MusicService);
  transformX = signal<number>(0);

  songs = signal<Song[]>([]);
  intervalRef?: number;

  ngOnInit() {
    this.musicService.getSongs().subscribe(data => {
      this.songs.set(data.songs);
    });

    this.intervalRef = setInterval(() => {
      const current = this.transformX();
      const rowWidth = this.songs().length * 166;

      let newX = 0;
      if (this.reversed) {
        newX = current + 1;
        if (newX >= 0) {
          this.transformX.set(-rowWidth);
        } else {
          this.transformX.set(newX);
        }
      } else {
        newX = current - 1;
        if (Math.abs(newX) >= rowWidth) {
          this.transformX.set(0);
        } else {
          this.transformX.set(newX);
        }
      }
    }, 16);
  }

  ngOnDestroy() {
    if (this.intervalRef) {
      clearInterval(this.intervalRef);
    }
  }

  transformStyle() {
    return `translateX(${this.transformX()}px)`;
  }

  playSong(song: Song) {
    if (!song) {
      return;
    }

    const collection = this.songs();
    if (collection.length) {
      this.musicService.setQueue(collection);
    }

    this.musicService.playSong(song);
  }
}