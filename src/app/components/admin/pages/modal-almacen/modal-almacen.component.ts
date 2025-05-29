import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil, finalize } from 'rxjs/operators';
import { UserService } from '../../../../services/user.service';

interface SizeQuantity {
  tallaId: string; // Para almacenar el ID real de la talla (ej. 'bda762c0b07ad771')
  tallaNombre: string; // Para almacenar el nombre legible de la talla (ej. 'S', 'M', 'L')
  quantity: number;
}

interface Modelo {
  _id: string;
  nombre: string;
}

interface Diseno {
  _id: string;
  nombre: string;
}

interface Tela {
  _id: string;
  disenoColor: string; // Asumiendo que esta es la propiedad que contiene el nombre/identificador de la tela
}

interface Talla {
  _id: string;
  talla: string;
}

@Component({
  selector: 'app-modal-almacen',
  imports: [CommonModule, FormsModule],
  templateUrl: './modal-almacen.component.html',
  styleUrls: ['./modal-almacen.component.css'],
})
export class ModalAlmacenComponent implements OnInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() productSaved = new EventEmitter<any>();

  modeloSeleccionado = ''; // Contiene el _id del modelo seleccionado del HTML
  disenoSeleccionado = ''; // Contiene el _id del diseño seleccionado del HTML
  telaSeleccionada = ''; // Contiene el _id de la tela seleccionada del HTML
  nuevaTalla = '';
  nuevaCantidad: number | null = null;
  sizeQuantities: SizeQuantity[] = [];

  modelos: Modelo[] = [];
  disenos: Diseno[] = [];
  telas: Tela[] = [];
  tallas: Talla[] = [];

  isLoading = false;
  isLoadingData = false;
  showError = false;
  errorMessage = '';
  datosInicializados = false;

  private destroy$ = new Subject<void>();

  constructor(private userService: UserService) {}

  ngOnInit() {
    // No cargar datos aquí, esperar a que se abra el modal
  }

  ngOnChanges(changes: SimpleChanges) {
    // Cuando el modal se abre (isOpen es true) y los datos no se han inicializado
    if (changes['isOpen'] && this.isOpen && !this.datosInicializados) {
      this.cargarDatosIniciales();
    }

    // Cuando el modal se cierra (isOpen es false)
    if (changes['isOpen'] && !this.isOpen) {
      this.limpiarFormulario();
    }
  }

  ngOnDestroy() {
    console.log('ModalAlmacenComponent destroyed');
    this.destroy$.next();
    this.destroy$.complete();
  }

  cargarDatosIniciales() {
    this.isLoadingData = true;
    this.errorMessage = '';
    this.showError = false;

    console.log('Iniciando carga de datos...');

    const datosIniciales$ = forkJoin({
      modelos: this.userService.obtener_modelo(),
      disenos: this.userService.obtener_diseno(),
      telas: this.userService.obtener_telas(),
      tallas: this.userService.obtener_tallas(),
    });

    datosIniciales$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoadingData = false;
          console.log('Carga de datos iniciales finalizada.');
        })
      )
      .subscribe({
        next: (datos) => {
          console.log('Datos cargados exitosamente:', datos);

          this.modelos = datos.modelos || [];
          this.disenos = datos.disenos || [];
          this.telas = datos.telas || [];
          this.tallas = datos.tallas || [];

          this.datosInicializados = true; // Marcar que los datos ya se cargaron

          console.log('Modelos cargados:', this.modelos.length);
          console.log('Diseños cargados:', this.disenos.length);
          console.log('Telas cargadas:', this.telas.length);
          console.log('Tallas cargadas:', this.tallas.length);
        },
        error: (error) => {
          console.error('Error al cargar datos iniciales:', error);
          this.errorMessage =
            'Error al cargar los datos necesarios. Por favor, inténtelo de nuevo.';
          this.showError = true;
          this.datosInicializados = false; // Si hay error, no marcar como inicializado
        },
      });
  }

  cerrarModal() {
    this.showError = false;
    this.errorMessage = '';
    this.limpiarFormulario(); // Limpiar el formulario al cerrar
    this.closeModal.emit();
  }

  eliminarTalla(index: number) {
    this.sizeQuantities.splice(index, 1);
  }

  agregarTallaCantidad() {
    // Validar que se haya seleccionado una talla y una cantidad válida
    if (!this.nuevaTalla || !this.nuevaCantidad || this.nuevaCantidad <= 0) {
      this.showError = true;
      this.errorMessage =
        'Por favor seleccione una talla y especifique una cantidad válida.';
      return;
    }

    // Buscar el objeto completo de la talla usando el ID seleccionado del <select>
    const selectedTallaObject = this.tallas.find(
      (t) => t._id === this.nuevaTalla
    );

    // Si no se encuentra la talla (lo cual no debería pasar si los datos están bien cargados)
    if (!selectedTallaObject) {
      this.errorMessage =
        'La talla seleccionada no es válida. Por favor, intente de nuevo.';
      this.showError = true;
      return;
    }

    // Verificar si la talla (por su ID) ya ha sido agregada al array sizeQuantities
    const existingSize = this.sizeQuantities.find(
      (sq) => sq.tallaId === selectedTallaObject._id
    );

    if (existingSize) {
      // Si ya existe, simplemente sumar la cantidad
      existingSize.quantity += this.nuevaCantidad;
    } else {
      // Si no existe, agregar una nueva entrada
      this.sizeQuantities.push({
        tallaId: selectedTallaObject._id, // Guardamos el ID para referencia interna
        tallaNombre: selectedTallaObject.talla, // Guardamos el NOMBRE para enviar al backend
        quantity: this.nuevaCantidad,
      });
    }

    // Limpiar los campos de entrada para la próxima talla
    this.nuevaTalla = '';
    this.nuevaCantidad = null;
    this.showError = false; // Limpiar cualquier mensaje de error anterior
    this.errorMessage = '';

    console.log('Tallas agregadas (sizeQuantities):', this.sizeQuantities);
  }

  guardarProducto() {
    this.showError = false;
    this.errorMessage = '';

    // Validar que todos los campos principales estén seleccionados y que haya al menos una talla
    if (
      !this.modeloSeleccionado ||
      !this.disenoSeleccionado ||
      !this.telaSeleccionada ||
      this.sizeQuantities.length === 0
    ) {
      this.showError = true;
      this.errorMessage =
        'Por favor complete todos los campos y agregue al menos una talla.';
      return;
    }

    // Validar que todas las tallas tengan datos válidos
    const tallasInvalidas = this.sizeQuantities.some(
      (item) => !item.tallaNombre || !item.quantity || item.quantity <= 0
    );

    if (tallasInvalidas) {
      this.showError = true;
      this.errorMessage =
        'Todas las tallas deben tener un nombre válido y una cantidad mayor a 0.';
      return;
    }

    // --- PASO CLAVE: Obtener los objetos completos para extraer sus NOMBRES ---
    const selectedModelo = this.modelos.find(
      (m) => m._id === this.modeloSeleccionado
    );
    const selectedDiseno = this.disenos.find(
      (d) => d._id === this.disenoSeleccionado
    );
    const selectedTela = this.telas.find(
      (t) => t._id === this.telaSeleccionada
    );

    // Validar que se encontraron los objetos correspondientes a los IDs seleccionados
    if (!selectedModelo) {
      this.showError = true;
      this.errorMessage =
        'Error: El modelo seleccionado no es válido o no se pudo cargar. Recargue los datos.';
      return;
    }
    if (!selectedDiseno) {
      this.showError = true;
      this.errorMessage =
        'Error: El diseño seleccionado no es válido o no se pudo cargar. Recargue los datos.';
      return;
    }
    if (!selectedTela) {
      this.showError = true;
      this.errorMessage =
        'Error: La tela seleccionada no es válida o no se pudo cargar. Recargue los datos.';
      return;
    }

    this.isLoading = true;

    // --- CONSTRUCCIÓN DEL OBJETO A ENVIAR AL BACKEND ---
    const productoParaAlmacen = {
      modelo: selectedModelo.nombre,
      diseno: selectedDiseno.nombre,
      tela: selectedTela.disenoColor,
      tallas: this.sizeQuantities.map((item) => ({
        talla: item.tallaNombre, // Asegurar que siempre haya un valor
        cantidad: item.quantity, // Asegurar que siempre haya un valor
      })),
      fechaRegistro: new Date().toISOString().split('T')[0], // Formato 'YYYY-MM-DD'
    };

    // Validar el objeto final antes de enviarlo
    console.log('Datos FINALES a enviar al backend:', productoParaAlmacen);
    console.log('Validación de tallas:', productoParaAlmacen.tallas);

    // Verificar que no haya objetos vacíos en tallas
    const tallasVacias = productoParaAlmacen.tallas.some(
      (talla) => !talla.talla || !talla.cantidad || talla.cantidad <= 0
    );

    if (tallasVacias) {
      this.showError = true;
      this.errorMessage =
        'Error interno: Se detectaron tallas con datos incompletos. Reintente la operación.';
      this.isLoading = false;
      return;
    }

    console.log('Calling insertar_almacen service');
    // Llamada al servicio para insertar el producto en el almacén
    this.userService
      .insertar_almacen(productoParaAlmacen)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          console.log('Producto guardado en almacén exitosamente:', response);
          this.productSaved.emit(response);
          this.cerrarModal();
        },
        error: (error) => {
          console.error('Error al guardar producto en almacén:', error);
          this.showError = true;
          this.errorMessage =
            error.error && error.error.message
              ? error.error.message
              : 'Hubo un error al guardar el producto. Por favor, inténtelo de nuevo.';
        },
      });
  }

  private limpiarFormulario() {
    this.modeloSeleccionado = '';
    this.disenoSeleccionado = '';
    this.telaSeleccionada = '';
    this.nuevaTalla = '';
    this.nuevaCantidad = null;
    this.sizeQuantities = [];
    this.isLoading = false;
    this.showError = false;
    this.errorMessage = '';
  }

  recargarDatos() {
    this.datosInicializados = false; // Forzar la recarga de datos
    this.cargarDatosIniciales();
  }

  // Getter para verificar si todos los datos iniciales están listos
  get datosListos(): boolean {
    return (
      this.datosInicializados &&
      this.modelos.length > 0 &&
      this.disenos.length > 0 &&
      this.telas.length > 0 &&
      this.tallas.length > 0
    );
  }
}
