import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { MusicListing } from './music-listing/music-listing';
import { RecentlyPlayed } from './recently-played/recently-played';
import { ArtistPage } from './artist-page/artist-page';
import { SearchResult } from './search-result/search-result';
import { MePage } from './me-page/me-page';
import { AlbumPage } from './album-page/album-page';
import { PlaylistPage } from './playlist-page/playlist-page';

export const routes: Routes = [
  {
    path: '',
    component: MainPage,
  },
  {
    path: 'songs',
    component: MusicListing
  },
  {
    path: 'recently-played',
    component: RecentlyPlayed
  },
  {
    path: 'artist/:name',
    component: ArtistPage
  },
  {
    path: 'search/:query',
    component: SearchResult
  },
  {
    path: "me",
    component: MePage,
  },
  {
    path: "album/:name",
    component: AlbumPage
  },
  {
    path: "playlist/:title",
    component: PlaylistPage
  }
];
