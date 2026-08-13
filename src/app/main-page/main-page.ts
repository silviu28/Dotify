import { Component, computed, inject } from '@angular/core';
import { RecentlyPlayed } from '../recently-played/recently-played';
import { RouterLink } from '@angular/router';
import { ImageConveyorBelt } from '../image-conveyor-belt/image-conveyor-belt';
import { UserPreferencesService } from '../user-preferences-service';

@Component({
  selector: 'app-main-page',
  imports: [RecentlyPlayed, RouterLink, ImageConveyorBelt],
  templateUrl: './main-page.html',
  styleUrl: './main-page.css',
})
export class MainPage {
  private userPrefsService = inject(UserPreferencesService);

  username = computed(() => this.userPrefsService.username());
}
