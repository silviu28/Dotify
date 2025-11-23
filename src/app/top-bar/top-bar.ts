import { Component, model, output, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-top-bar',
  imports: [RouterLink],
  templateUrl: './top-bar.html',
  styleUrl: './top-bar.css',
})
export class TopBar {
  searchTerm = model<string>('');
  searchChange = output<string>();
  private router = inject(Router);

  onInput(value: string) {
    this.searchChange.emit(value);
  }

  navigateHome() {
    this.router.navigate(["/"]);
  }
}
