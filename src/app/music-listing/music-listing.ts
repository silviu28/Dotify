import { Component, inject, model, signal, OnInit } from '@angular/core';
import { SongContainer } from "../song-container/song-container"; // Import the component
import { Song } from '../../types';
import { MusicService } from '../music-service';
import { ArtistListing } from "../artist-listing/artist-listing";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-music-listing',
  // Add SongContainer to imports so we can use it in HTML
  imports: [SongContainer, ArtistListing, FormsModule], 
  templateUrl: './music-listing.html',
  styleUrl: './music-listing.css',
})
export class MusicListing implements OnInit {
  songs = signal<Song[]>([]);
  searchQuery = model<string>('');
  
  private musicService = inject(MusicService);

  ngOnInit() {
    this.musicService.getSongs().subscribe(data => {
        this.songs.set(data.songs);
        this.musicService.setQueue(data.songs);
    });
  }

  onSearchChange() {
    const search = this.searchQuery().trim();
    const updateSongs = (songs: Song[]) => {
       this.songs.set(songs);
       this.musicService.setQueue(songs); 
    };

    if(search === '') {
      this.musicService.getSongs().subscribe(data => updateSongs(data.songs));
    }
    else {
      this.musicService.getSongsByName(search).subscribe(songs => updateSongs(songs));
    }
  }

  // METHOD: Plays the selected song when a container is clicked
  play(song: Song) {
    this.musicService.playSong(song);
  }
}