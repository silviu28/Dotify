import { Component } from '@angular/core';
import { RecentlyPlayed } from "../recently-played/recently-played";
import { MusicListing } from "../music-listing/music-listing";
import { ArtistListing } from "../artist-listing/artist-listing";
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-main-page',
  imports: [RecentlyPlayed, MusicListing, ArtistListing, RouterLink],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {

}
