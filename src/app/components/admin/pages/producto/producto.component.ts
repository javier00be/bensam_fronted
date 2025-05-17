import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalImagenComponent } from '../modal-imagen/modal-imagen.component';
import { FormsModule } from '@angular/forms';
// Importa el componente del modal
@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalImagenComponent // <-- Añade el componente modal aquí
  ],
  templateUrl: './producto.component.html'
})
export class ProductoComponent {
  // Aquí irá la lógica para manejar productos
  isUploadModalOpen = false; // Variable para controlar la visibilidad del modal

   // Propiedad para la tonalidad seleccionada
  selectedTonalidadColor: string = '#9f2f31'; // Inicializa con el color actual (vino)

  // ... otras propiedades y métodos de tu componente ...

  // Método para abrir el modal de subida
  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  // Método para cerrar el modal de subida (llamado por el modal a través del evento)
  closeUploadModal(): void {
    this.isUploadModalOpen = false;
  }

  // Método para manejar los archivos recibidos del modal
  handleSelectedFiles(files: File[]): void {
    console.log('Archivos recibidos en el componente principal:', files);
    // TODO: Aquí implementas la lógica para subir estos archivos a tu backend o servicio de almacenamiento.
    // Puedes usar HttpClient para enviar un FormData con los archivos.
    // Ejemplo:
    // const formData = new FormData();
    // for (const file of files) {
    //   formData.append('images', file, file.name); // 'images' es el nombre esperado por tu backend
    // }
    // this.yourApiService.uploadFiles(formData).subscribe({
    //   next: (response) => { console.log('Subida exitosa', response); },
    //   error: (error) => { console.error('Error en la subida', error); },
    //   complete: () => { this.closeUploadModal(); } // Cerrar modal después de completar (éxito o error)
    // });

    // Cerrar el modal después de (o antes de) iniciar la carga
    // this.closeUploadModal(); // Decide cuándo cerrarlo
  }
}