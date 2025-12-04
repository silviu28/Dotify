import { Component } from '@angular/core';
import { RecentlyPlayed } from "../recently-played/recently-played";
import { MusicListing } from "../music-listing/music-listing";
import { ArtistListing } from "../artist-listing/artist-listing";

@Component({
  selector: 'app-main-page',
  imports: [RecentlyPlayed, MusicListing, ArtistListing],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {

}
