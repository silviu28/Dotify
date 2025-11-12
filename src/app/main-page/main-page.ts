import { Component } from '@angular/core';
import { RecentlyPlayed } from "../recently-played/recently-played";
import { MusicListing } from "../music-listing/music-listing";

@Component({
  selector: 'app-main-page',
  imports: [RecentlyPlayed, MusicListing],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {

}
