import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-imagen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './modal-imagen.component.html',
  styleUrl: './modal-imagen.component.css'
})
export class ModalImagenComponent {
  @Input() isOpen: boolean = false; // Propiedad de entrada para controlar si el modal está abierto
  @Output() closeModal = new EventEmitter<void>(); // Evento de salida para cerrar el modal
  @Output() filesSelected = new EventEmitter<File[]>(); // Evento de salida para enviar los archivos seleccionados al padre

  selectedFiles: File[] = []; // Array para almacenar los archivos seleccionados
  imagePreviews: string[] = []; // Array para almacenar las URLs de las previsualizaciones

  // Método para cerrar el modal y limpiar el estado
  close(): void {
    this.selectedFiles = []; // Limpiar archivos seleccionados
    this.imagePreviews = []; // Limpiar previsualizaciones
    this.isOpen = false; // Opcional: puedes controlar esto solo desde el padre usando la propiedad de input
    this.closeModal.emit(); // Emitir evento para que el padre cierre el modal
  }

  // Manejar archivos seleccionados a través del input type="file"
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.handleFiles(Array.from(input.files));
      input.value = ''; // Limpiar el valor del input para permitir seleccionar los mismos archivos de nuevo
    }
  }

  // Prevenir comportamiento por defecto al arrastrar sobre el área
  onDragOver(event: DragEvent): void {
    event.preventDefault(); // Esto es necesario para permitir el "drop"
    // Opcional: añadir clases para feedback visual (e.g., borde azul)
  }

  // Manejar cuando el arrastre sale del área (opcional)
  onDragLeave(event: DragEvent): void {
    // Opcional: quitar clases de feedback visual
  }

  // Manejar archivos soltados en el área de drag-and-drop
  onDrop(event: DragEvent): void {
    event.preventDefault(); // Prevenir que el navegador abra el archivo
    // Opcional: quitar clases de feedback visual
    if (event.dataTransfer?.files) {
      this.handleFiles(Array.from(event.dataTransfer.files));
    }
  }

  // Lógica común para procesar la lista de archivos
  handleFiles(files: File[]): void {
    // Filtrar para asegurar que solo se añaden imágenes si es necesario
    const imageFiles = files.filter(file => file.type.startsWith('image/'));

    // Añadir los nuevos archivos a la lista existente, evitando duplicados por nombre si se desea
    // Para simplicidad aquí, solo añadimos todos
    this.selectedFiles = [...this.selectedFiles, ...imageFiles];

    this.previewFiles(); // Generar previsualizaciones para los nuevos archivos
  }

  // Generar URLs de previsualización para las imágenes seleccionadas
  previewFiles(): void {
    this.imagePreviews = []; // Limpiar previsualizaciones existentes
    this.selectedFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.imagePreviews.push(e.target.result as string);
        }
      };
      reader.readAsDataURL(file); // Leer el archivo como una URL de datos
    });
  }

  // Eliminar un archivo seleccionado por índice
  removeFile(index: number): void {
    this.selectedFiles.splice(index, 1); // Eliminar el archivo del array
    this.previewFiles(); // Regenerar las previsualizaciones
  }

  // Método llamado al hacer clic en el botón de "Subir Imágenes"
  uploadImages(): void {
    if (this.selectedFiles.length > 0) {
      console.log('Archivos listos para subir:', this.selectedFiles);
      this.filesSelected.emit(this.selectedFiles); // Emitir los archivos al componente padre
      // Aquí NO cerramos el modal automáticamente, podrías querer esperar la respuesta del servidor
      // o cerrarlo en el padre después de iniciar la carga.
      // Si quieres cerrarlo inmediatamente: this.close();
    } else {
      console.warn('No hay archivos seleccionados para subir.');
    }
  }
}
