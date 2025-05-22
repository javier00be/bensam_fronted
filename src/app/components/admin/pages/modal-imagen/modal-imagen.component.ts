import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage, ImageTransform } from 'ngx-image-cropper';

@Component({
  selector: 'app-modal-imagen',
  standalone: true,
  imports: [
    CommonModule,
    ImageCropperComponent
  ],
  templateUrl: './modal-imagen.component.html',
  styleUrl: './modal-imagen.component.css'
})
export class ModalImagenComponent {
  @Input() isOpen: boolean = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() filesSelected = new EventEmitter<File[]>();

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  selectedFiles: File[] = [];
  imagePreviews: string[] = [];

  // Propiedades para el recorte - CONFIGURACIÓN CORREGIDA
  imageChangedEvent: Event | null = null;
  croppedImage: string = '';
  showCropper: boolean = false;
  currentFileToCrop: File | null = null;
  transform: ImageTransform = {};
  canvasRotation: number = 0;
  cropperReady_: boolean = false; // Nueva propiedad para controlar el estado

  close(): void {
    this.selectedFiles = [];
    this.imagePreviews = [];
    this.resetCropperState();
    this.closeModal.emit();

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onFileSelected(event: Event): void {
    console.log('Archivo seleccionado');
    const input = event.target as HTMLInputElement;

    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log('Archivo:', file);

      if (file.type.startsWith('image/')) {
        this.currentFileToCrop = file;
        this.imageChangedEvent = event;
        this.showCropper = true;
        this.croppedImage = '';
        this.cropperReady_ = false; // Resetear el estado
        console.log('Mostrando cropper');
      } else {
        this.resetCropperState();
        alert('Por favor, selecciona solo archivos de imagen.');
      }
    } else {
      this.resetCropperState();
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.add('border-blue-500', 'bg-blue-50');
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('border-blue-500', 'bg-blue-50');
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    const target = event.currentTarget as HTMLElement;
    target.classList.remove('border-blue-500', 'bg-blue-50');

    if (event.dataTransfer?.files && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      console.log('Archivo arrastrado:', file);

      if (file.type.startsWith('image/')) {
        this.currentFileToCrop = file;
        const simulatedEvent = this.createFileEvent(file);
        this.imageChangedEvent = simulatedEvent;
        this.showCropper = true;
        this.croppedImage = '';
        this.cropperReady_ = false; // Resetear el estado
        console.log('Mostrando cropper desde drag & drop');
      } else {
        this.resetCropperState();
        alert('Por favor, arrastra solo archivos de imagen.');
      }
    } else {
      this.resetCropperState();
    }
  }

  private createFileEvent(file: File): Event {
    const dt = new DataTransfer();
    dt.items.add(file);

    const input = document.createElement('input');
    input.type = 'file';
    input.files = dt.files;

    const event = new Event('change', { bubbles: true });
    Object.defineProperty(event, 'target', {
      writable: false,
      value: input
    });

    return event;
  }

  resetCropperState(): void {
    console.log('Reseteando cropper');
    this.showCropper = false;
    this.currentFileToCrop = null;
    this.imageChangedEvent = null;
    this.croppedImage = '';
    this.transform = {};
    this.canvasRotation = 0;
    this.cropperReady_ = false;

    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // Métodos del Cropper - CORREGIDOS
  imageCropped(event: ImageCroppedEvent): void {
    console.log('imageCropped ejecutado:', event);

    // Priorizar base64 para mayor compatibilidad
    if (event.base64) {
      this.croppedImage = event.base64;
      console.log('Imagen recortada guardada con base64, longitud:', this.croppedImage.length);
    } else if (event.blob) {
      // Convertir blob a base64
      const reader = new FileReader();
      reader.onload = () => {
        this.croppedImage = reader.result as string;
        console.log('Imagen recortada convertida desde blob a base64');
      };
      reader.onerror = () => {
        console.error('Error al convertir blob a base64');
      };
      reader.readAsDataURL(event.blob);
    } else {
      console.warn('No se recibió base64 ni blob en imageCropped:', event);
      this.croppedImage = '';
    }
  }

  imageLoaded(image: LoadedImage): void {
    console.log('Imagen cargada exitosamente:', image);
    this.cropperReady_ = false; // El cropper aún no está listo
  }

  cropperReady(): void {
    console.log('Cropper listo');
    this.cropperReady_ = true;

    // Pequeño delay para asegurar que el cropper esté completamente inicializado
    setTimeout(() => {
      console.log('Cropper completamente inicializado');
    }, 100);
  }

  loadImageFailed(): void {
    console.error('Error al cargar imagen');
    this.resetCropperState();
    alert('No se pudo cargar la imagen. Verifica que sea un formato válido.');
  }

  // Métodos de control del cropper
  zoomToFit(): void {
    this.transform = {
      ...this.transform,
      scale: 1
    };
  }

  resetImage(): void {
    this.transform = {};
    this.canvasRotation = 0;
  }

  addCroppedImage(): void {
    console.log('Añadiendo imagen recortada...');
    console.log('croppedImage existe:', !!this.croppedImage);
    console.log('croppedImage longitud:', this.croppedImage.length);
    console.log('currentFileToCrop existe:', !!this.currentFileToCrop);
    console.log('cropperReady:', this.cropperReady_);

    if (!this.cropperReady_) {
      alert('El recortador aún se está cargando. Espera un momento e intenta de nuevo.');
      return;
    }

    if (!this.croppedImage || this.croppedImage.length === 0) {
      alert('No hay imagen recortada para añadir. Asegúrate de seleccionar un área de la imagen y esperar a que se procese.');
      return;
    }

    if (!this.currentFileToCrop) {
      alert('No hay archivo original. Inténtalo de nuevo.');
      return;
    }

    // Validar que la imagen sea un dataURL válido
    if (!this.croppedImage.startsWith('data:image/')) {
      console.error('Formato de imagen inválido:', this.croppedImage.substring(0, 50));
      alert('El formato de la imagen recortada no es válido. Inténtalo de nuevo.');
      return;
    }

    try {
      const timestamp = Date.now();
      const originalName = this.currentFileToCrop.name.replace(/\.[^/.]+$/, ''); // Remove extension
      const fileName = `cropped_${timestamp}_${originalName}.png`;

      console.log('Convirtiendo imagen a archivo...');
      console.log('DataURL válido, procediendo con conversión');

      const croppedFile = this.dataURLtoFile(
        this.croppedImage,
        fileName,
        'image/png'
      );

      this.selectedFiles.push(croppedFile);
      this.imagePreviews.push(this.croppedImage);

      console.log(`Imagen añadida exitosamente. Total: ${this.selectedFiles.length}`);

      this.resetCropperState();

    } catch (error) {
      console.error('Error al procesar la imagen:', error);
      alert(`Error al procesar la imagen recortada: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  removeFile(index: number): void {
    if (index >= 0 && index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
      this.imagePreviews.splice(index, 1);
      console.log(`Imagen ${index + 1} eliminada. Total restante: ${this.selectedFiles.length}`);
    }
  }

  uploadImages(): void {
    if (this.selectedFiles.length > 0) {
      console.log('Emitiendo archivos para subir:', this.selectedFiles.length);
      this.filesSelected.emit(this.selectedFiles);
      this.close();
    } else {
      alert('No hay imágenes para subir.');
    }
  }

  private dataURLtoFile(dataurl: string, filename: string, mimeType: string = 'image/png'): File {
    try {
      console.log('Convirtiendo dataURL a File...');
      console.log('DataURL tipo:', typeof dataurl);
      console.log('DataURL inicia con data:image:', dataurl.startsWith('data:image/'));
      console.log('DataURL contiene coma:', dataurl.includes(','));

      // Validaciones básicas
      if (!dataurl || typeof dataurl !== 'string') {
        throw new Error('DataURL inválido: no es una cadena válida');
      }

      if (!dataurl.startsWith('data:image/')) {
        throw new Error('DataURL inválido: no es una imagen válida');
      }

      if (!dataurl.includes(',')) {
        throw new Error('DataURL inválido: formato incorrecto (no contiene coma)');
      }

      // Dividir el dataURL
      const parts = dataurl.split(',');
      if (parts.length !== 2) {
        throw new Error('DataURL inválido: formato de partes incorrecto');
      }

      const header = parts[0]; // data:image/png;base64
      const data = parts[1];   // datos base64

      if (!data || data.length === 0) {
        throw new Error('DataURL inválido: no hay datos base64');
      }

      console.log('Header:', header);
      console.log('Data length:', data.length);

      // Decodificar base64
      let binaryString: string;
      try {
        binaryString = atob(data);
      } catch (e) {
        throw new Error('Error al decodificar base64: datos corruptos');
      }

      // Convertir a Uint8Array
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // Crear archivo
      const file = new File([bytes], filename, { type: mimeType });
      console.log('Archivo creado exitosamente:', {
        name: file.name,
        size: file.size,
        type: file.type
      });

      return file;

    } catch (error) {
      console.error('Error detallado en dataURLtoFile:', error);
      throw error; // Re-lanzar el error para que se maneje en addCroppedImage
    }
  }
}
