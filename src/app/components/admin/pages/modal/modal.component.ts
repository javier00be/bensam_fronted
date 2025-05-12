import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
})
export class ModalComponent {
  // Input para controlar si el modal está abierto o cerrado
  @Input() isVisible: boolean = false;

  // Input para determinar el tipo de modal (model, design, fabric)
  @Input() modalType: 'model' | 'design' | 'fabric' = 'model';

  // Contenido del input para modelo y diseño
  content: string = '';

  // Contenidos específicos para tela
  fabricDesign: string = '';
  fabricTexture: string = '';

  // Output para emitir un evento cuando se cierre el modal
  @Output() closeModalEvent: EventEmitter<void> = new EventEmitter();

  // Output para emitir el contenido cuando se guarda
  @Output() saveContentEvent: EventEmitter<{ type: string; content: string }> =
    new EventEmitter();

  // Método para cerrar el modal
  closeModal() {
    this.closeModalEvent.emit();
    this.resetForm();
  }

  // Método para guardar el contenido
  saveContent() {
    this.saveContentEvent.emit({
      type: this.modalType,
      content: this.content,
    });
    this.resetForm();
    this.closeModal();
  }

  // Método específico para guardar el contenido de tela
  saveFabricContent() {
    // Combina diseño y textura en un formato legible
    const combinedContent = `Diseño: ${this.fabricDesign}, Textura: ${this.fabricTexture}`;

    this.saveContentEvent.emit({
      type: 'fabric',
      content: combinedContent,
    });
    this.resetForm();
    this.closeModal();
  }

  // Método para reiniciar el formulario
  resetForm() {
    this.content = '';
    this.fabricDesign = '';
    this.fabricTexture = '';
  }
}
