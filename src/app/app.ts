import { Component, signal, model } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from "./top-bar/top-bar";
import { Player } from "./player/player";
import { Song } from '../types';
import { Suspense } from "./suspense/suspense";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBar, Player, Suspense],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Dotify');
  searchTerm = model<string>('');
  playingSong = signal<Song | null>(null);

  constructor() {
    // make sure that prefs is set even if localStorage is empty
    if (!window.electronAPI) {
      const rawPrefs = localStorage.getItem("prefs");
      if (!rawPrefs) localStorage.setItem("prefs", "{}");
    }
  }
}
