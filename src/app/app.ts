import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TopBar } from "./top-bar/top-bar";
import { MainPage } from "./main-page/main-page";
import { Player } from "./player/player";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopBar, MainPage, Player],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Dotify');
}
