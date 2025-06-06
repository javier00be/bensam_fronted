import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalAlmacenComponent } from '../modal-almacen/modal-almacen.component';
import { UserService } from '../../../../services/user.service';
import { Router } from '@angular/router';

// Interfaz para un elemento de talla dentro del array 'tallas'
export interface TallaItem {
  size: string; // Puede ser "S", "M", "L", "2", "4", "XS", "XL", etc.
  quantity: number; // La cantidad para esa talla específica
  _id?: string; // Propiedad opcional para el ID de la talla si viene del backend
}

// Interfaz para los datos del producto (cómo los almacenas en el frontend)
export interface ProductoInventario {
  _id?: string;
  modelo: string; // Nombre del modelo para visualización
  diseno: string; // Nombre del diseño para visualización
  tela: string; // Nombre de la tela para visualización
  modeloId?: string; // ID del modelo (para enviar al backend)
  disenoId?: string; // ID del diseño (para enviar al backend)
  telaId?: string; // ID de la tela (para enviar al backend)
  fechaEntrada?: string;
  ultimaActualizacion?: string;
  tallas: TallaItem[];
}

// Interfaz para las opciones de filtro que incluyen _id y nombre
export interface FiltroOpcion {
  _id: string;
  nombre: string;
}

@Component({
  selector: 'app-almacen',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAlmacenComponent],
  templateUrl: './almacen.component.html',
  styleUrls: ['./almacen.component.css'],
})
export class AlmacenComponent implements OnInit {
  modalAbierto = false;
  mostrarDetallesInventario = false;
  tallasVisibles: { [key: string]: boolean } = {};
  productos: ProductoInventario[] = [];

  // Propiedades para el formulario de filtros (ahora guardarán los NOMBRES seleccionados)
  modeloFiltro: string = '';
  disenoFiltro: string = '';
  telaFiltro: string = '';

  terminoBusqueda: string = '';

  // Opciones para los selectores, ahora con _id y nombre
  opcionesModelo: FiltroOpcion[] = [];
  opcionesDiseno: FiltroOpcion[] = [];
  opcionesTela: FiltroOpcion[] = [];
  opcionesTalla: string[] = [];

  isLoading: boolean = true;
  errorMessage: string | null = null;

  svgWidth: number = 800;
  svgHeight: number = 200;

  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarOpcionesFiltro();
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.obtener_almacen().subscribe({
      next: (data: any[]) => {
        this.productos = data.map((item) => {
          const mappedTallas: TallaItem[] = (item.tallas || []).map(
            (t: any) => ({
              size: (t.size || t.talla)?.toString() || 'N/A',
              quantity:
                typeof (t.quantity || t.cantidad) === 'number'
                  ? t.quantity || t.cantidad
                  : 0,
              _id: t._id, // <--- Asegúrate de capturar el _id de la talla si está disponible
            })
          );

          return {
            _id: item._id,
            // Asume que el backend ya "populate" los nombres para display
            modelo: item.modelo?.nombre || item.modelo || 'N/A', // Maneja si viene como objeto populado o solo ID
            diseno: item.diseno?.nombre || item.diseno || 'N/A',
            tela: item.tela?.disenoColor || item.tela || 'N/A', // Asumiendo 'disenoColor' para tela
            // Si el backend te devuelve los IDs originales, los guardas también
            modeloId: item.modelo?._id || null,
            disenoId: item.diseno?._id || null,
            telaId: item.tela?._id || null,
            fechaEntrada: item.fechaEntrada
              ? new Date(item.fechaEntrada).toLocaleDateString()
              : 'N/A',
            tallas: mappedTallas,
          };
        });

        this.opcionesTalla = [
          ...new Set(
            this.productos.flatMap((p) => p.tallas.map((t) => t.size))
          ),
        ].sort();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorMessage =
          'No se pudieron cargar los productos. Intenta de nuevo más tarde.';
        this.isLoading = false;
      },
    });
  }

  cargarOpcionesFiltro(): void {
    this.userService.obtener_modelo().subscribe({
      next: (data: any[]) =>
        (this.opcionesModelo = data
          .map((item) => ({ _id: item._id, nombre: item.nombre }))
          .filter((n) => n.nombre)),
      error: (err) => console.error('Error al cargar modelos:', err),
    });
    this.userService.obtener_diseno().subscribe({
      next: (data: any[]) =>
        (this.opcionesDiseno = data
          .map((item) => ({ _id: item._id, nombre: item.nombre }))
          .filter((n) => n.nombre)),
      error: (err) => console.error('Error al cargar diseños:', err),
    });
    this.userService.obtener_telas().subscribe({
      next: (data: any[]) =>
        (this.opcionesTela = data
          .map((item) => ({ _id: item._id, nombre: item.disenoColor }))
          .filter((n) => n.nombre)),
      error: (err) => console.error('Error al cargar telas:', err),
    });
  }

  abrirModal(): void {
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
  }

  toggleInventoryDetails(): void {
    this.mostrarDetallesInventario = !this.mostrarDetallesInventario;
  }

  toggleTallas(itemId: string | number): void {
    const id = itemId.toString();
    this.tallasVisibles[id] = !this.tallasVisibles[id];
  }

  onProductoGuardado(producto: any): void {
    console.log('onProductoGuardado called', producto);

    const mappedTallas: TallaItem[] = (producto.tallas || []).map((t: any) => ({
      size: (t.size || t.talla)?.toString() || 'N/A',
      quantity:
        typeof (t.quantity || t.cantidad) === 'number'
          ? t.quantity || t.cantidad
          : 0,
      _id: t._id, // Asegúrate de capturar el _id si está disponible
    }));

    const mappedProducto: ProductoInventario = {
      ...producto,
      modelo: producto.modelo?.nombre || producto.modelo || 'N/A',
      diseno: producto.diseno?.nombre || producto.diseno || 'N/A',
      tela: producto.tela?.disenoColor || producto.tela || 'N/A',
      modeloId: producto.modelo?._id || null,
      disenoId: producto.diseno?._id || null,
      telaId: producto.tela?._id || null,
      tallas: mappedTallas,
      fechaEntrada: producto.fechaEntrada
        ? new Date(producto.fechaEntrada).toLocaleDateString()
        : 'N/A',
    };

    this.productos.push(mappedProducto);
  }

  get cantidadTotalInventario(): number {
    return this.productosFiltrados.reduce((total, producto) => {
      return (
        total +
        producto.tallas.reduce(
          (sumTallas, talla) => sumTallas + talla.quantity,
          0
        )
      );
    }, 0);
  }

  private getCantidadTotalPorTalla(size: string): number {
    return this.productosFiltrados.reduce((total, producto) => {
      const tallaEncontrada = producto.tallas.find(
        (t) => t.size.toUpperCase() === size.toUpperCase()
      );
      return total + (tallaEncontrada ? tallaEncontrada.quantity : 0);
    }, 0);
  }

  get cantidadTotalS(): number {
    return this.getCantidadTotalPorTalla('S');
  }
  get cantidadTotalM(): number {
    return this.getCantidadTotalPorTalla('M');
  }
  get cantidadTotalL(): number {
    return this.getCantidadTotalPorTalla('L');
  }
  get cantidadTotalXS(): number {
    return this.getCantidadTotalPorTalla('XS');
  }
  get cantidadTotalXL(): number {
    return this.getCantidadTotalPorTalla('XL');
  }
  get cantidadTotalXXL(): number {
    return this.getCantidadTotalPorTalla('XXL');
  }

  get tallasParaGrafico(): {
    size: string;
    quantity: number;
    _id?: string;
    color: string;
  }[] {
    const tallasMap: { [key: string]: { quantity: number; _id?: string } } = {};

    this.productosFiltrados.forEach((producto) => {
      producto.tallas.forEach((talla) => {
        const size = talla.size.toUpperCase();
        if (!tallasMap[size]) {
          tallasMap[size] = { quantity: 0, _id: talla._id }; // Inicializa con el _id si es el primero
        }
        tallasMap[size].quantity += talla.quantity;
      });
    });

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

    const sortedTallas = Object.keys(tallasMap)
      .sort((a, b) => {
        const indexA = order.indexOf(a);
        const indexB = order.indexOf(b);

        if (indexA !== -1 && indexB !== -1) {
          return indexA - indexB;
        }
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
      })
      .map((size) => {
        let color = 'bg-gray-400';
        switch (size) {
          case 'S':
            color = 'bg-black';
            break;
          case 'M':
            color = 'bg-gray-700';
            break;
          case 'L':
            color = 'bg-gray-400';
            break;
          case 'XS':
            color = 'bg-gray-600';
            break;
          case 'XL':
            color = 'bg-gray-300';
            break;
          case 'XXL':
            color = 'bg-gray-200';
            break;
        }
        return {
          size,
          quantity: tallasMap[size].quantity,
          _id: tallasMap[size]._id,
          color,
        };
      });

    return sortedTallas;
  }

  get maxQuantityForChart(): number {
    let max = 0;
    this.tallasParaGrafico.forEach((talla) => {
      if (talla.quantity > max) {
        max = talla.quantity;
      }
    });
    return max > 0 ? max * 1.2 : 10;
  }

  get chartWidth(): number {
    const minWidthPerPoint = 60;
    return Math.max(
      this.svgWidth,
      this.tallasParaGrafico.length * minWidthPerPoint
    );
  }

  get chartLinePoints(): string {
    if (this.tallasParaGrafico.length === 0) {
      return '';
    }

    const paddingY = this.svgHeight * 0.1;
    const effectiveHeight = this.svgHeight - 2 * paddingY;
    const xStep =
      this.chartWidth /
      (this.tallasParaGrafico.length > 1
        ? this.tallasParaGrafico.length - 1
        : 1);

    return this.tallasParaGrafico
      .map((talla, i) => {
        const x = i * xStep;
        const y =
          this.svgHeight -
          (talla.quantity / this.maxQuantityForChart) * effectiveHeight -
          paddingY;
        return `${x},${y}`;
      })
      .join(' ');
  }

  get svgViewBox(): string {
    return `0 0 ${this.chartWidth} ${this.svgHeight}`;
  }

  get Math(): typeof Math {
    return Math;
  }

  get productosFiltrados(): ProductoInventario[] {
    let productosFiltrados = [...this.productos];

    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(
        (producto) =>
          producto.modelo.toLowerCase().includes(termino) ||
          producto.diseno.toLowerCase().includes(termino) ||
          producto.tela.toLowerCase().includes(termino) ||
          producto.tallas.some((talla) =>
            talla.size.toLowerCase().includes(termino)
          )
      );
    }

    // Filtrar por modelo (usando el nombre seleccionado en el filtro)
    if (this.modeloFiltro) {
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto.modelo === this.modeloFiltro
      );
    }

    // Filtrar por diseño (usando el nombre seleccionado en el filtro)
    if (this.disenoFiltro) {
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto.diseno === this.disenoFiltro
      );
    }

    // Filtrar por tela (usando el nombre seleccionado en el filtro)
    if (this.telaFiltro) {
      productosFiltrados = productosFiltrados.filter(
        (producto) => producto.tela === this.telaFiltro
      );
    }

    return productosFiltrados;
  }

  limpiarFiltros(): void {
    this.modeloFiltro = '';
    this.disenoFiltro = '';
    this.telaFiltro = '';
    this.terminoBusqueda = '';
  }

  // Nuevo método para navegar a la página de producto con los datos
  // En AlmacenComponent.ts
  agregarProducto(): void {
    console.log(
      'Botón Agregar Producto clickeado. Intentando navegar a /admin/producto...'
    );

    // Busca los objetos completos (con _id) para el modelo, diseño y tela seleccionados
    const modeloSeleccionado = this.opcionesModelo.find(
      (opt) => opt.nombre === this.modeloFiltro
    );
    const disenoSeleccionado = this.opcionesDiseno.find(
      (opt) => opt.nombre === this.disenoFiltro
    );
    const telaSeleccionada = this.opcionesTela.find(
      (opt) => opt.nombre === this.telaFiltro
    );

    this.router.navigate(['/admin/producto'], {
      queryParams: {
        // Pasa los IDs de los elementos seleccionados, si existen
        modeloId: modeloSeleccionado ? modeloSeleccionado._id : '',
        disenoId: disenoSeleccionado ? disenoSeleccionado._id : '',
        telaId: telaSeleccionada ? telaSeleccionada._id : '',
        // Opcional: También puedes pasar los nombres para visualización en ProductoComponent
        modeloNombre: this.modeloFiltro,
        disenoNombre: this.disenoFiltro,
        telaNombre: this.telaFiltro,

        cantidadTotal: this.cantidadTotalInventario,
        // Pasa las tallas incluyendo sus _id si están disponibles
        tallas: JSON.stringify(this.tallasParaGrafico),
      },
    });
  }
}
