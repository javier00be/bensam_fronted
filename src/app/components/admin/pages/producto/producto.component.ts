import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalImagenComponent } from '../modal-imagen/modal-imagen.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

// Re-exporta la interfaz TallaItem si no está ya disponible globalmente
export interface TallaItem {
  size: string;
  quantity: number;
  _id?: string;
  color?: string; // Añadido para compatibilidad con tallasParaGrafico
}

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalImagenComponent,
  ],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css']
})
export class ProductoComponent implements OnInit, OnDestroy {

  isUploadModalOpen = false;
  selectedTonalidadColor: string = '#9f2f31';

  productImages: string[] = [];
  currentImageUrl: string | null = null;
  activeImageIndex: number = 0;

  nombreProducto: string = '';
  modelo: string = '';
  diseno: string = '';
  tela: string = '';
  cantidadTotalGeneral: number = 0; // Cantidad total del inventario (pasada desde Almacen)

  // Nuevas propiedades para manejar las tallas y la cantidad seleccionada
  productTallas: TallaItem[] = []; // Array de tallas para este producto
  selectedTalla: TallaItem | null = null; // La talla actualmente seleccionada
  displayQuantity: number = 0; // La cantidad que se mostrará (total o por talla)

  precio: string = '';
  categoria: string = '';
  descripcion: string = '';

  private queryParamsSubscription: Subscription | undefined;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(params => {
      this.modelo = params['modelo'] || '';
      this.diseno = params['diseno'] || '';
      this.tela = params['tela'] || '';
      this.cantidadTotalGeneral = +params['cantidadTotal'] || 0; // Cantidad total del inventario

      // Parsear el array de tallas si está presente
      if (params['tallas']) {
        try {
          this.productTallas = JSON.parse(params['tallas']);
          // Ordenar las tallas para una visualización consistente
          const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2', '4', '6', '8', '10', '12', '14', '16'];
          this.productTallas.sort((a, b) => {
            const indexA = order.indexOf(a.size.toUpperCase());
            const indexB = order.indexOf(b.size.toUpperCase());
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            return a.size.localeCompare(b.size);
          });

          // Establecer la primera talla como seleccionada por defecto si hay tallas
          if (this.productTallas.length > 0) {
            this.selectTalla(this.productTallas[0]);
          }
        } catch (e) {
          console.error('Error al parsear las tallas:', e);
          this.productTallas = [];
        }
      } else {
        this.productTallas = [];
      }

      // Inicializar la cantidad a mostrar con la cantidad total general
      this.displayQuantity = this.cantidadTotalGeneral;

      this.nombreProducto = `${this.modelo} ${this.diseno} ${this.tela}`.trim();
      console.log('ProductoComponent inicializado con query params:', {
        modelo: this.modelo,
        diseno: this.diseno,
        tela: this.tela,
        cantidadTotalGeneral: this.cantidadTotalGeneral,
        productTallas: this.productTallas
      });
    });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    this.productImages.forEach((url) => {
      // Si usas URL.createObjectURL, revócalo aquí: URL.revokeObjectURL(url);
    });
  }

  // Método para seleccionar una talla y actualizar la cantidad mostrada
  selectTalla(talla: TallaItem): void {
    this.selectedTalla = talla;
    this.displayQuantity = talla.quantity;
    console.log(`Talla seleccionada: ${talla.size}, Cantidad: ${talla.quantity}`);
  }

  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
  }

  handleSelectedFiles(files: File[]): void {
    console.log('Archivos recibidos en el componente principal:', files);

    this.productImages = [];
    this.currentImageUrl = null;
    this.activeImageIndex = 0;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          this.productImages.push(e.target.result as string);
          if (!this.currentImageUrl) {
            this.currentImageUrl = this.productImages[0];
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (files.length === 0) {
      this.currentImageUrl = null;
    }
  }

  setActiveImage(index: number): void {
    if (index >= 0 && index < this.productImages.length) {
      this.activeImageIndex = index;
      this.currentImageUrl = this.productImages[index];
    }
  }

  guardarProducto(): void {
    console.log('Guardando producto con los siguientes datos:', {
      nombre: this.nombreProducto,
      modelo: this.modelo,
      diseno: this.diseno,
      tela: this.tela,
      cantidadTotalGeneral: this.cantidadTotalGeneral, // Puedes guardar la cantidad total general
      tallas: this.productTallas, // Y el array de tallas
      precio: this.precio,
      categoria: this.categoria,
      descripcion: this.descripcion,
      tonalidadColor: this.selectedTonalidadColor,
      images: this.productImages
    });
    // Implementa tu lógica de guardado real aquí (ej. llamar a un servicio).
  }
}
