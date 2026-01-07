import { Component, ElementRef, HostListener, ViewChild, inject, model, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationStart, RouterLink, Router } from '@angular/router';
import { NotificationPanel } from '../notification-panel/notification-panel';
import { filter } from 'rxjs';

@Component({
  selector: 'app-top-bar',
  imports: [NotificationPanel],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  searchTerm = model<string>('');
  private router = inject(Router);
  showNotificationPanel = signal<boolean>(false);
  notifications = signal<string[]>([]);
  @ViewChild(NotificationPanel, { read: ElementRef })
  private notificationPanelRef?: ElementRef<HTMLElement>;
  @ViewChild('notificationToggle', { read: ElementRef })
  private notificationToggleRef?: ElementRef<HTMLElement>;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationStart => event instanceof NavigationStart),
        takeUntilDestroyed()
      )
      .subscribe(() => this.showNotificationPanel.set(false));
  }

  navigateHome() {
    this.router.navigate(['/'], { replaceUrl: true });
    this.searchTerm.set('');
  }

  navigateToLibrary() {
    this.router.navigate(['/songs']);
  }

  navigateToFavorites() {
    this.router.navigate(['/favorites']);
  }

  search() {
    if (this.searchTerm() === '') return;

    this.router.navigate(["/search", encodeURI(this.searchTerm())]);
  }

  toggleNotificationPanel() {
    this.showNotificationPanel.set(!this.showNotificationPanel());
  }

  // Close the notification panel when the user clicks anywhere else on screen
  @HostListener('document:click', ['$event'])
  handleDocumentClick(event: MouseEvent) {
    if (!this.showNotificationPanel()) {
      return;
    }

    const target = event.target as Node | null;
    const clickedToggle = !!target && !!this.notificationToggleRef?.nativeElement.contains(target);
    const insidePanel = !!target && !!this.notificationPanelRef?.nativeElement.contains(target);

    if (clickedToggle || insidePanel) {
      return;
    }

    this.showNotificationPanel.set(false);
  }

  navigateToMe() {
    this.router.navigate(["/me"]);
  }

  navigateToSettings() {
    this.router.navigate(["/settings"]);
  }
}
