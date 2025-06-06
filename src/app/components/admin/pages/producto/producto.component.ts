import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModalImagenComponent } from '../modal-imagen/modal-imagen.component';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { UserService } from '../../../../services/user.service';

// Re-exporta la interfaz TallaItem si no está ya disponible globalmente
export interface TallaItem {
  size: string;
  quantity: number;
  _id?: string;
  color?: string; // Añadido para compatibilidad con tallasParaGrafico
}

// Define an interface for your category data to ensure type safety
export interface Category {
  _id: string; // Assuming your backend returns an _id for categories
  nombre: string; // Or whatever property holds the category name
  // Add other properties if your category object has them, e.g., description: string;
}

@Component({
  selector: 'app-producto',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalImagenComponent],
  templateUrl: './producto.component.html',
  styleUrls: ['./producto.component.css'],
})
export class ProductoComponent implements OnInit, OnDestroy {
  isUploadModalOpen = false;
  selectedTonalidadColor: string = '#9f2f31';

  isLoading: boolean = false; // <-- Nueva propiedad para el estado de carga

  // ✅ Renombramos productImages a imagesForPreview para mayor claridad
  // Aunque tu HTML usa productImages, en el TS, es mejor que sea claro
  // Lo corregiremos en el HTML más tarde o renombraremos esta variable a `productImages`
  imagesForPreview: string[] = []; // Contendrá las Data URLs para la previsualización (usada por `currentImageUrl`)
  currentImageUrl: string | null = null; // La URL de la imagen grande actual en la vista previa
  activeImageIndex: number = 0;

  // ✅ Nueva propiedad para los archivos File ORIGINALES que se enviarán al backend
  // Esta variable es CRÍTICA para la subida a Cloudinary
  filesToUpload: File[] = [];

  nombreProducto: string = '';
  modelo: string = '';
  diseno: string = '';
  tela: string = '';
  cantidadTotalGeneral: number = 0; // Cantidad total del inventario (pasada desde Almacen)

  modeloId: string = '';
  disenoId: string = '';
  telaId: string = '';

  productTallas: TallaItem[] = [];
  selectedTalla: TallaItem | null = null;
  displayQuantity: number = 0;

  precio: string = '';
  categoria: string = '';
  descripcion: string = '';

  categories: Category[] = [];

  private queryParamsSubscription: Subscription | undefined;
  private categoriesSubscription: Subscription | undefined;

  constructor(
    private route: ActivatedRoute,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.queryParamsSubscription = this.route.queryParams.subscribe(
      (params) => {
        this.modelo = params['modeloNombre'] || '';
        this.diseno = params['disenoNombre'] || '';
        this.tela = params['telaNombre'] || '';

        this.modeloId = params['modeloId'] || '';
        this.disenoId = params['disenoId'] || '';
        this.telaId = params['telaId'] || '';

        this.cantidadTotalGeneral = +params['cantidadTotal'] || 0;

        if (params['tallas']) {
          try {
            this.productTallas = JSON.parse(params['tallas']);
            const order = [
              'XS',
              'S',
              'M',
              'L',
              'XL',
              'XXL',
              '2',
              '4',
              '6',
              '8',
              '10',
              '12',
              '14',
              '16',
            ];
            this.productTallas.sort((a, b) => {
              const indexA = order.indexOf(a.size.toUpperCase());
              const indexB = order.indexOf(b.size.toUpperCase());
              if (indexA !== -1 && indexB !== -1) return indexA - indexB;
              if (indexA !== -1) return -1;
              if (indexB !== -1) return 1;
              return a.size.localeCompare(b.size);
            });

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

        this.displayQuantity = this.cantidadTotalGeneral;
        this.nombreProducto =
          `${this.modelo} ${this.diseno} ${this.tela}`.trim();

        console.log('ProductoComponent inicializado con query params:', {
          modelo: this.modelo,
          diseno: this.diseno,
          tela: this.tela,
          cantidadTotalGeneral: this.cantidadTotalGeneral,
          productTallas: this.productTallas,
        });
      }
    );

    this.categoriesSubscription = this.userService
      .obtener_categorias()
      .subscribe({
        next: (data) => {
          this.categories = data;
          console.log('Categorías cargadas:', this.categories);
        },
        error: (error) => {
          console.error('Error al obtener las categorías:', error);
        },
      });
  }

  ngOnDestroy(): void {
    if (this.queryParamsSubscription) {
      this.queryParamsSubscription.unsubscribe();
    }
    if (this.categoriesSubscription) {
      this.categoriesSubscription.unsubscribe();
    }
    // ✅ Importante: Revocar URLs si usaste URL.createObjectURL para las previews
    // Si solo usas FileReader.readAsDataURL (como ahora), no es estrictamente necesario,
    // ya que las Data URLs se auto-gestionan, pero no está de más.
    // this.imagesForPreview.forEach(url => URL.revokeObjectURL(url)); // Descomenta si usas createObjectURL
  }

  selectTalla(talla: TallaItem): void {
    this.selectedTalla = talla;
    this.displayQuantity = talla.quantity;
    console.log(
      `Talla seleccionada: ${talla.size}, Cantidad: ${talla.quantity}`
    );
  }

  openUploadModal(): void {
    this.isUploadModalOpen = true;
  }

  closeUploadModal(): void {
    this.isUploadModalOpen = false;
  }

  // ✅ REVISADO: handleSelectedFiles para previsualización
  handleSelectedFiles(files: File[]): void {
    console.log(
      'Archivos recibidos en el componente principal para previsualización y subida:',
      files
    );

    this.filesToUpload = files; // ✅ Guarda los archivos File originales para la subida real

    this.imagesForPreview = []; // ✅ Limpia las previsualizaciones anteriores
    this.currentImageUrl = null;
    this.activeImageIndex = 0;

    if (files.length > 0) {
      files.forEach((file, index) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            const previewUrl = e.target.result as string;
            this.imagesForPreview.push(previewUrl); // ✅ Almacena Base64 para previsualización en imagesForPreview

            // Si es la primera imagen, configúrala como la imagen principal
            if (index === 0) {
              this.currentImageUrl = previewUrl; // ✅ Establece la primera imagen como la activa en currentImageUrl
              this.activeImageIndex = 0;
            }
          }
        };
        reader.readAsDataURL(file); // Lee el archivo como Data URL (Base64) para la previsualización
      });
    }
  }

  // ✅ REVISADO: setActiveImage para cambiar la imagen principal de previsualización
  setActiveImage(index: number): void {
    if (index >= 0 && index < this.imagesForPreview.length) {
      // ✅ Usa imagesForPreview
      this.activeImageIndex = index;
      this.currentImageUrl = this.imagesForPreview[index]; // ✅ Usa currentImageUrl
    }
  }

  async guardarProducto(): Promise<void> {
    this.isLoading = true; // <-- Activa el estado de carga al inicio

    let finalImageUrls: string[] = [];

    if (this.filesToUpload.length > 0) {
      try {
        const uploadPromises = this.filesToUpload.map((file) =>
          this.userService.uploadImage(file).toPromise()
        );
        const uploadResults = await Promise.all(uploadPromises);
        finalImageUrls = uploadResults
          .map((res) => res?.url)
          .filter(Boolean) as string[];
        console.log('URLs de imágenes subidas a Cloudinary:', finalImageUrls);
      } catch (uploadError) {
        console.error('Error al subir imágenes a Cloudinary:', uploadError);
        // alert('Hubo un error al subir las imágenes. El producto no se guardará.'); // Elimina esta alerta
        this.isLoading = false; // <-- Desactiva la carga en caso de error
        // Podrías mostrar un modal de error aquí o un toast
        return;
      }
    }

    // En el método guardarProducto()
    const productData = {
      nombre: this.nombreProducto,
      modelo: this.modeloId,
      diseno: this.disenoId,
      tela: this.telaId,
      categoria: this.categoria, // Coincide con el esquema
      precio: this.precio, // Convertido a Number
      tonalidad: this.selectedTonalidadColor, // ✨ CAMBIO AQUÍ: Ahora se llama 'tonalidad'
      descripcion: this.descripcion,
      cantidadInventario: this.cantidadTotalGeneral,
      tallas: this.productTallas.map((talla) => ({
        talla: talla.size, // Se mapea 'size' a 'talla'
        cantidad: talla.quantity, // Se mapea 'quantity' a 'cantidad'
      })),
      imagenes: finalImageUrls,
      // 'activo' no es necesario enviarlo, el esquema tiene un valor por defecto
    };

    console.log(
      'Datos a enviar al backend para guardar producto:',
      productData
    );

    this.userService.insertar_producto(productData).subscribe({
      next: (response) => {
        console.log('Producto guardado exitosamente:', response);
        // alert('Producto guardado exitosamente!'); // Elimina esta alerta
        this.isLoading = false; // <-- Desactiva la carga en éxito
        // Podrías mostrar un modal de éxito aquí
        this.router.navigate(['/admin/almacen']);
      },
      error: (error) => {
        console.error('Error al guardar el producto:', error);
        // alert('Hubo un error al guardar el producto. Por favor, intenta de nuevo.'); // Elimina esta alerta
        this.isLoading = false; // <-- Desactiva la carga en error
        // Podrías mostrar un modal de error aquí
      },
    });
  }
}
