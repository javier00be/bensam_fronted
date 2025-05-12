import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css']
})
export class MaterialComponent {
  // Variable para controlar la visibilidad del modal
  showModal: boolean = false;

  // Variable para controlar el tipo de modal actual
  currentModalType: 'model' | 'design' | 'fabric' = 'model';

  // Variables para almacenar los contenidos guardados
  savedModel: string = '';
  savedDesign: string = '';
  savedFabric: string = '';

  // Método para abrir el modal según el tipo
  openModal(type: 'model' | 'design' | 'fabric') {
    this.currentModalType = type;
    this.showModal = true;
  }

  // Método para cerrar el modal
  closeModal() {
    this.showModal = false;
  }

  // Método para manejar el contenido guardado desde el modal
  handleSavedContent(event: { type: string, content: string }) {
    // Guardar el contenido según el tipo
    switch (event.type) {
      case 'model':
        this.savedModel = event.content;
        break;
      case 'design':
        this.savedDesign = event.content;
        break;
      case 'fabric':
        this.savedFabric = event.content;
        break;
    }

    // Aquí podrías hacer lo que necesites con el contenido guardado
    console.log(`${event.type} guardado:`, event.content);
  }

  // Método para guardar todo el formulario
  onSubmit() {
    // Aquí iría la lógica para enviar todos los datos al backend
    const formData = {
      model: this.savedModel,
      design: this.savedDesign,
      fabric: this.savedFabric
    };

    console.log('Datos del formulario completo:', formData);
    // Implementar llamada al servicio para guardar datos
  }
}
