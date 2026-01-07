import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-text-pill',
  imports: [],
  templateUrl: './text-pill.html',
  styleUrl: './text-pill.css',
})
export class TextPill {
  @Input() declare text: string;
  @Input() removable = false;

  @Output() remove = new EventEmitter<void>();

  onRemove() {
    this.remove.emit();
  }
}
