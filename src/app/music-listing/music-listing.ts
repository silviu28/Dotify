import { Component } from '@angular/core';
import { SongContainer } from "../song-container/song-container";

@Component({
  selector: 'app-music-listing',
  imports: [SongContainer],
  templateUrl: './music-listing.html',
  styleUrl: './music-listing.css',
})
export class MusicListing {

}
