import { Component, inject, model, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  searchTerm = model<string>('');
  private router = inject(Router);
  showNotificationPanel = signal<boolean>(false);
  notifications = signal<string[]>([]);

  navigateHome() {
    this.router.navigate(['/'], { replaceUrl: true });
    this.searchTerm.set('');
  }

  navigateToLibrary() {
    this.router.navigate(['/songs']);
  }

  search() {
    if(this.searchTerm() === '') {
      this.navigateHome();
      return;
    }

    this.router.navigate(["/search", encodeURI(this.searchTerm())]);
  }

  toggleNotificationPanel() {
    this.showNotificationPanel.set(!this.showNotificationPanel());
  }

  navigateToMe() {
    this.router.navigate(["/me"]);
  }
}
