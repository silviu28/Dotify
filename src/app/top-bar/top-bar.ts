import { Component, inject, signal } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  searchTerm = signal<string>('');
  private router = inject(Router);

  navigateHome() {
    this.router.navigate(['/'], { replaceUrl: true });
    this.searchTerm.set('');
  }

  search() {
    if(this.searchTerm() === '') {
      this.navigateHome();
      return;
    }

    this.router.navigate(["/search", encodeURI(this.searchTerm())]);
  }
}
