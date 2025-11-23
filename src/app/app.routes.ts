import { Routes } from '@angular/router';
import { MainPage } from './main-page/main-page';
import { MusicListing } from './music-listing/music-listing';
import { RecentlyPlayed } from './recently-played/recently-played';
import { ArtistPage } from './artist-page/artist-page';

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
    }
];
