import { Component, inject, model, signal } from '@angular/core';
import { SongContainer } from "../song-container/song-container";
import { Song } from '../../types';
import { OnInit } from '@angular/core';
import { MusicService } from '../music-service';
import { ArtistListing } from "../artist-listing/artist-listing";

@Component({
  selector: 'app-music-listing',
  imports: [SongContainer, ArtistListing],
  templateUrl: './music-listing.html',
  styleUrl: './music-listing.css',
})
export class MusicListing implements OnInit {
  songs = signal<Song[]>([]);
  searchQuery = model<string>('');
  
  // Inject the service (already present in your code)
  musicService = inject(MusicService);

  ngOnInit() {
    this.musicService
      .getSongs()
      .subscribe(data => {
        console.log(data);
        this.songs.set(data.songs);
        console.log("Showing songs", this.songs());
      });
  }

  onSearchChange() {
    const search = this.searchQuery().trim();
    if(search === '') {
      this.musicService.getSongs().subscribe(data => {
        this.songs.set(data.songs);
      });
    }
    else {
      this.musicService.getSongsByName(search).subscribe(songs => {
        this.songs.set(songs);
      });
    }
  }

  play(song: Song) {
    console.log("Playing:", song.title);
    this.musicService.playSong(song);
  }

}
