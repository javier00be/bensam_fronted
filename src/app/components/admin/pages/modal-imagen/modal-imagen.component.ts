import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
// Importa el componente directamente (ya que es standalone) y sus tipos
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-modal-imagen',
  standalone: true,
  imports: [
    CommonModule,
    ImageCropperComponent // <--- ¡Añade ImageCropperComponent aquí! (Correcto)
  ],
  templateUrl: './modal-imagen.component.html',
  styleUrl: './modal-imagen.component.css'
})
export class ModalImagenComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() filesSelected = new EventEmitter<File[]>(); // Evento para el componente padre

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>; // Para resetear el input de tipo file

  selectedFiles: File[] = []; // Array para almacenar los archivos ya procesados (recortados)
  imagePreviews: string[] = []; // Array para almacenar las URLs de previsualización de los archivos procesados

  // --- Propiedades y lógica para el recorte ---
  imageChangedEvent: any = ''; // Contiene el evento del input de archivo, necesario para el cropper
  croppedImage: string = ''; // La imagen recortada en formato Base64 (Data URL)
  showCropper: boolean = false; // Controla la visibilidad del componente de recorte
  currentFileToCrop: File | null = null; // El archivo File que se está recortando actualmente

  // --- Métodos del Modal ---
  close(): void {
    // Limpiar todos los estados al cerrar el modal
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.croppedImage = '';
    this.showCropper = false;
    this.currentFileToCrop = null;
    this.imageChangedEvent = ''; // Asegúrate de limpiar también el evento del cropper

    this.closeModal.emit(); // Emite el evento para que el componente padre cierre el modal
    // Resetear el valor del input de archivo para permitir seleccionar el mismo archivo de nuevo
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // --- Manejo de Archivos (Input y Drag & Drop) ---
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    console.log('>>> onFileSelected: Evento recibido:', event); // DEBUG
    console.log('>>> onFileSelected: Archivos en input:', input.files); // DEBUG

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      // Verifica si es una imagen antes de intentar cargarla en el cropper
      if (file.type.startsWith('image/')) {
        this.currentFileToCrop = file;
        this.imageChangedEvent = event; // <--- ¡Esto es CRUCIAL! Pasa el evento al cropper. (Correcto)
        this.showCropper = true; // Mostrar el cropper
        input.value = ''; // Limpiar el valor del input file después de tomar el archivo
        console.log('>>> onFileSelected: Imagen válida, mostrando cropper.'); // DEBUG
      } else {
        console.warn('>>> onFileSelected: Archivo seleccionado no es una imagen:', file.type); // DEBUG
        this.showCropper = false;
        this.currentFileToCrop = null;
        this.imageChangedEvent = '';
        alert('Por favor, selecciona solo archivos de imagen.');
      }
    } else {
      console.log('>>> onFileSelected: No se seleccionó ningún archivo.'); // DEBUG
      this.showCropper = false; // Ocultar el cropper si no se seleccionó nada
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('border-blue-500', 'bg-blue-50'); // Feedback visual al arrastrar
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('border-blue-500', 'bg-blue-50'); // Quitar feedback
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('border-blue-500', 'bg-blue-50'); // Quitar feedback

    console.log('>>> onDrop: Evento recibido:', event); // DEBUG
    console.log('>>> onDrop: Archivos en dataTransfer:', event.dataTransfer?.files); // DEBUG

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        this.currentFileToCrop = file;
        this.imageChangedEvent = event; // <--- ¡Esto es CRUCIAL! Pasa el evento al cropper. (Correcto)
        this.showCropper = true; // Mostrar el cropper
        console.log('>>> onDrop: Imagen válida, mostrando cropper.'); // DEBUG
      } else {
        console.warn('>>> onDrop: Archivo soltado no es una imagen:', file.type); // DEBUG
        this.showCropper = false;
        this.currentFileToCrop = null;
        this.imageChangedEvent = '';
        alert('Por favor, arrastra solo archivos de imagen.');
      }
    } else {
      console.log('>>> onDrop: No se soltó ningún archivo.'); // DEBUG
      this.showCropper = false; // Ocultar si no se soltó nada
    }
  }

  // --- Métodos del Cropper (eventos que emite image-cropper) ---
  imageCropped(event: ImageCroppedEvent) {
    // Este método se llama cada vez que el usuario mueve o escala el área de recorte.
    // 'event.base64' contiene la imagen recortada en formato Data URL (Base64).
    this.croppedImage = event.base64 as string;
    console.log('>>> Cropper: Imagen recortada generada.'); // DEBUG
  }

  imageLoaded(image: LoadedImage) {
    // Opcional: Lógica a ejecutar cuando la imagen se carga completamente en el cropper.
    console.log('>>> Cropper: Imagen cargada exitosamente en el cropper:', image); // DEBUG
  }

  cropperReady() {
    // Opcional: Lógica a ejecutar cuando el cropper está inicializado y listo para interactuar.
    console.log('>>> Cropper: Cropper listo.'); // DEBUG
  }

  loadImageFailed() {
    // Manejo de errores si la imagen no se puede cargar en el cropper (ej. formato inválido).
    console.error('>>> Cropper: ERROR - Fallo al cargar la imagen para recortar.'); // DEBUG
    this.showCropper = false; // Ocultar cropper en caso de error
    this.currentFileToCrop = null;
    this.imageChangedEvent = '';
    alert('No se pudo cargar la imagen. Asegúrate de que sea un formato de imagen válido.');
  }

  // --- Gestión de Archivos Procesados (después de recortar) ---
  addCroppedImage(): void {
    if (this.croppedImage && this.currentFileToCrop) {
      // Convertir la Data URL (Base64) de la imagen recortada a un objeto File.
      // Esto es crucial porque el componente padre espera un array de File objects
      // para la subida real al servidor.
      const croppedFile = this.dataURLtoFile(
        this.croppedImage,
        `cropped_${Date.now()}_${this.currentFileToCrop.name}`, // Nombre único para el archivo recortado
        this.currentFileToCrop.type // Mantiene el tipo MIME original del archivo
      );

      this.selectedFiles.push(croppedFile); // Añade el objeto File recortado a la lista para emitir
      this.imagePreviews.push(this.croppedImage); // Añade la Data URL para mostrar en las previsualizaciones

      // Resetear el estado del cropper para permitir un nuevo recorte o cerrar la vista de recorte
      this.showCropper = false;
      this.croppedImage = '';
      this.currentFileToCrop = null;
      this.imageChangedEvent = '';
      console.log('>>> Archivo recortado añadido a la lista.'); // DEBUG
    } else {
      console.warn('>>> No hay imagen recortada para añadir.'); // DEBUG
    }
  }

  removeFile(index: number): void {
    if (index > -1 && index < this.selectedFiles.length) {
      // Si el archivo que se va a eliminar es el que actualmente se está recortando,
      // reiniciamos el estado del cropper.
      if (this.selectedFiles[index] === this.currentFileToCrop) {
        this.showCropper = false;
        this.currentFileToCrop = null;
        this.croppedImage = '';
        this.imageChangedEvent = '';
      }
      this.selectedFiles.splice(index, 1); // Elimina el archivo del array principal
      this.imagePreviews.splice(index, 1); // Elimina la previsualización correspondiente
      console.log('>>> Archivo en índice', index, 'eliminado.'); // DEBUG
    }
  }

  // --- Método Final para Emitir al Padre ---
  uploadImages(): void {
    if (this.selectedFiles.length > 0) {
      console.log('>>> Subiendo imágenes:', this.selectedFiles); // DEBUG
      // Emite el array de File objects (que ya están recortados) al componente padre.
      this.filesSelected.emit(this.selectedFiles);
      this.close(); // Cierra el modal después de emitir los archivos
    } else {
      console.warn('>>> No hay archivos seleccionados para subir.'); // DEBUG
    }
  }

  // --- Función Helper: Convierte Data URL (Base64) a File Object ---
  private dataURLtoFile(dataurl: string, filename: string, mimeType: string): File {
    const arr = dataurl.split(',');
    const mime = mimeType || arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[arr.length - 1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  // --- Método de PRUEBA para Depuración ---
  loadTestImage(): void {
    // Puedes usar una URL de imagen de prueba o incluso una Data URL Base64 directa aquí
    const imageUrl = 'https://picsum.photos/400/400?random=1'; // Imagen aleatoria, asegúrate de que sea accesible (sin CORS si está en otro dominio)

    fetch(imageUrl)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], 'test-image.png', { type: 'image/png' });

        // Crea un evento simulado que imita el evento de un input file
        // El tipo 'unknown as Event' es un truco para TypeScript ya que estamos construyendo un evento manualmente.
        const simulatedEvent = {
          target: {
            files: [file]
          }
        } as unknown as Event;

        this.currentFileToCrop = file;
        this.imageChangedEvent = simulatedEvent;
        this.showCropper = true;
        console.log('>>> loadTestImage: Imagen de prueba cargada para cropper:', file);
      })
      .catch(error => console.error('>>> loadTestImage: ERROR al cargar imagen de prueba:', error));
  }
}
