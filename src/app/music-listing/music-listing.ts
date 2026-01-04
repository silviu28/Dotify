import { Component, inject, model, signal, OnInit, computed } from '@angular/core';
import { SongContainer } from "../song-container/song-container"; // Import the component
import { GroupCriterion, Song, SortCriterion } from '../../types';
import { MusicService } from '../music-service';
import { ArtistListing } from "../artist-listing/artist-listing";
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-music-listing',
  // Add SongContainer to imports so we can use it in HTML
  imports: [SongContainer, FormsModule], 
  templateUrl: './music-listing.html',
  styleUrl: './music-listing.css',
})
export class MusicListing implements OnInit {
  songs = signal<Song[]>([]);
  searchQuery = model<string>('');

  sortingCriterion = model<SortCriterion>("No sort");
  sortingCriteria: SortCriterion[] = ["No sort", "Title", "Album", "Artist"];

  groupingCriterion = model<GroupCriterion>("No group");
  groupingCriteria: GroupCriterion[] = ["No group", "Album", "Artist"];

  // use a computed signal to both sort and group songs by given criteria
  sortedSongGroups = computed(() => {
    console.log("sorting and grouping songs...");
    const _songs = this.songs();

    switch (this.sortingCriterion()) {
    case "Album":
      _songs.sort((s1, s2) => s1.album.localeCompare(s2.album));
      break;

    case "Artist":
      _songs.sort((s1, s2) => s1.artist.localeCompare(s2.artist));
      break;

    case "Title":
      _songs.sort((s1, s2) => s1.title.localeCompare(s2.title));
      break;
    // Apply nothing
    default: break;
    }

    const songGroups = new Map<string, Song[]>();
    switch (this.groupingCriterion()) {
    case "Album":
      _songs.forEach(song => {
        if (songGroups.has(song.album)) {
          songGroups.set(song.album,
            [... songGroups.get(song.album)!, song]
          );
        } else {
          songGroups.set(song.album, [song]);
        }
      });
      break;

    case "Artist":
      _songs.forEach(song => {
        if (songGroups.has(song.artist)) {
          songGroups.set(song.artist,
            [... songGroups.get(song.artist)!, song]
          );
        } else {
          songGroups.set(song.artist, [song]);
        }
      });
      break;
      
    default:
      // make one big group
      songGroups.set("All", _songs);
      break;
    }

    // flatten the map to an array for ease of iteration
    return Array.from(songGroups.entries());
  });
  
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