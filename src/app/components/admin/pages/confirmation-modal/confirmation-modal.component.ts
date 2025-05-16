// confirmation-modal.component.ts
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-modal.component.html',
})
export class ConfirmationModalComponent {
  @Input() isVisible: boolean = false;
  @Input() itemType: string = '';
  @Input() itemName: string = '';
  @Output() confirmEvent = new EventEmitter<boolean>();

  closeModal(confirmed: boolean): void {
    this.confirmEvent.emit(confirmed);
  }
}
