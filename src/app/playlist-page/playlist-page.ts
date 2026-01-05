import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MusicService } from '../music-service';
import { UserPreferencesService } from '../user-preferences-service';
import { Song } from '../../types';
import { SongContainer } from "../song-container/song-container";

@Component({
  selector: 'app-playlist-page',
  imports: [SongContainer],
  templateUrl: './playlist-page.html',
  styleUrl: './playlist-page.css',
})
export class PlaylistPage implements OnInit {
  private activatedRoute = inject(ActivatedRoute);
  private userPreferencesService = inject(UserPreferencesService);
  private musicService = inject(MusicService);

  playlist = computed(() =>
    this.userPreferencesService
      .savedPlaylists()
      .get(this.playlistName())
      ?? { title: "how", songs: [] }
  );

  playlistName = signal<string>("");

  ngOnInit() {
    this.activatedRoute.params.subscribe(
      params => this.playlistName.set(decodeURI(String(params["title"])))
    );
  }

  addToQueue(song: Song) {
    this.musicService.addToQueue(song);
  }
}
