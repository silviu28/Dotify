import { Component, Input, WritableSignal } from '@angular/core';

@Component({
  selector: 'app-notification-panel',
  imports: [],
  templateUrl: './notification-panel.html',
  styleUrl: './notification-panel.css'
})
export class NotificationPanel {
  // pass as signal to interact (dismiss, expand, etc.)
  @Input() declare notifications: WritableSignal<string[]>;
}
