import { Component, signal, model } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from "./top-bar/top-bar";
import { Player } from "./player/player";
import { Song } from '../types';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBar, Player],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Dotify');
  searchTerm = model<string>('');
  playingSong = signal<Song | null>(null);
}
