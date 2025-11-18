import { Component, Inject, signal } from '@angular/core';
import { SongContainer } from "../song-container/song-container";
import { Song } from '../../types';
import { OnInit } from '@angular/core';
import { MusicService } from '../music-service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-music-listing',
  imports: [SongContainer],
  templateUrl: './music-listing.html',
  styleUrl: './music-listing.css',
})
export class MusicListing implements OnInit {
  songs = signal<Song[]>([]);

  constructor(@Inject(MusicService) private musicService: MusicService) {}

  ngOnInit() {
    this.musicService
      .getSongs()
      .subscribe(data => {
        console.log(data);
        // data is of type object with the songs in the "songs" key
        // typescript bug
        this.songs.set((data as any).songs);
        console.log("Showing songs", this.songs());
      });
  }
}
