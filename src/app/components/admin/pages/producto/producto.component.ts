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
    ModalImagenComponent, // <-- Añade el componente modal aquí
  ],
  templateUrl: './producto.component.html',
})
export class ProductoComponent {
  // Aquí irá la lógica para manejar productos
  isUploadModalOpen = false; // Variable para controlar la visibilidad del modal

  // Propiedad para la tonalidad seleccionada
  selectedTonalidadColor: string = '#9f2f31'; // Inicializa con el color actual (vino)

  // ... otras propiedades y métodos de tu componente ...
  // Nuevas propiedades para la gestión de imágenes
  productImages: string[] = []; // Array para almacenar las URLs de las imágenes
  currentImageUrl: string | null = null; // URL de la imagen actualmente visible
  activeImageIndex: number = 0; // Índice de la imagen activa para los indicadores

  // Método para abrir el modal de subida
  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  // Método para cerrar el modal de subida (llamado por el modal a través del evento)
  closeUploadModal(): void {
    this.isUploadModalOpen = false;
  }

  handleSelectedFiles(files: File[]): void {
    console.log('Archivos recibidos en el componente principal:', files);

    // Limpiamos las URLs de previsualización anteriores para evitar duplicados si se selecciona un nuevo set
    // Si quieres permitir añadir más imágenes sin borrar las anteriores, modifica esta lógica.
    this.productImages = [];
    this.currentImageUrl = null;
    this.activeImageIndex = 0;

    // Generar URLs temporales para previsualización en el cliente
    // ¡IMPORTANTE! En un entorno de producción, aquí subirías los 'files' a un servidor
    // y recibirías las URLs permanentes para almacenarlas en 'productImages'.
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.productImages.push(e.target.result as string);
          // Si es la primera imagen o si no hay ninguna imagen actual, la establecemos
          if (!this.currentImageUrl) {
            this.currentImageUrl = this.productImages[0];
          }
        }
      };
      reader.readAsDataURL(file); // Lee el archivo como una URL de datos (base64)
    });

    // Si no se seleccionó ningún archivo, asegúrate de que no haya imagen actual
    if (files.length === 0) {
      this.currentImageUrl = null;
    }
  }

  // Método para cambiar la imagen activa cuando se hace clic en un indicador
  setActiveImage(index: number): void {
    if (index >= 0 && index < this.productImages.length) {
      this.activeImageIndex = index;
      this.currentImageUrl = this.productImages[index];
    }
  }

  // Limpiar URLs temporales al destruir el componente para evitar fugas de memoria
  ngOnDestroy(): void {
    this.productImages.forEach((url) => {
      // Solo revocar si son URLs de objeto (creadas con URL.createObjectURL)
      // Las Data URLs (base64) no necesitan ser revocadas.
      // Si en producción usas URL.createObjectURL, asegúrate de revocarlo.
      // Si usas Data URLs o URLs de servidor, no es necesario.
    });
  }
}
