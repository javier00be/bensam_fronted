import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalAlmacenComponent } from '../modal-almacen/modal-almacen.component';
import { UserService } from '../../../../services/user.service';

// Interfaz para un elemento de talla dentro del array 'tallas'
export interface TallaItem {
  size: string;     // Puede ser "S", "M", "L", "2", "4", "XS", "XL", etc.
  quantity: number; // La cantidad para esa talla específica
  _id?: string;
}

// Interfaz para los datos del producto
export interface ProductoInventario {
  _id?: string;
  modelo: string;
  diseno: string;
  tela: string;
  fechaEntrada?: string; // Nombre de la propiedad de fecha en tu API
  ultimaActualizacion?: string; // Otra propiedad de fecha si existe
  tallas: TallaItem[]; // ¡Aquí está el cambio clave! Solo el array de tallas
}

@Component({
  selector: 'app-almacen',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAlmacenComponent],
  templateUrl: './almacen.component.html',
  styleUrls: ['./almacen.component.css']
})
export class AlmacenComponent implements OnInit {

  // Control del modal
  modalAbierto = false;

  // Control de visibilidad de detalles del inventario
  mostrarDetallesInventario = false;

  // Control de visibilidad de tallas por producto (usa el _id o el índice)
  tallasVisibles: { [key: string]: boolean } = {};

  // Datos del inventario, ahora inicializado como un array vacío
  productos: ProductoInventario[] = [];

  // Propiedades para el formulario de filtros
  modeloFiltro: string = '';
  disenoFiltro: string = '';
  telaFiltro: string = '';

  // Propiedad para la búsqueda
  terminoBusqueda: string = '';

  // Opciones para los selectores, se cargarán dinámicamente
  opcionesModelo: string[] = [];
  opcionesDiseno: string[] = [];
  opcionesTela: string[] = [];
  opcionesTalla: string[] = []; // Nueva propiedad para las opciones de talla si quieres filtrar por talla

  // Indicador de carga
  isLoading: boolean = true;
  errorMessage: string | null = null;

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.cargarProductos();
    this.cargarOpcionesFiltro();
  }

  cargarProductos(): void {
    this.isLoading = true;
    this.errorMessage = null;
    this.userService.obtener_almacen().subscribe({
      next: (data: any[]) => { // Recibir como 'any[]' temporalmente para el mapeo
        this.productos = data.map(item => {
          // Asegúrate de que las tallas tengan 'size' y 'quantity'
          const mappedTallas: TallaItem[] = (item.tallas || []).map((t: any) => ({
            // Usamos 'size' o 'talla' para el nombre de la talla
            size: (t.size || t.talla)?.toString() || 'N/A', // Convertir a string y manejar nulos
            // Usamos 'quantity' o 'cantidad' para la cantidad, asegurando que sea un número
            quantity: typeof (t.quantity || t.cantidad) === 'number' ? (t.quantity || t.cantidad) : 0
          }));

          return {
            _id: item._id,
            modelo: item.modelo,
            diseno: item.diseno,
            tela: item.tela,
            // Formatear la fecha para mostrarla, manteniendo la original si es necesario para lógica interna
            fechaEntrada: item.fechaEntrada ? new Date(item.fechaEntrada).toLocaleDateString() : 'N/A',
            tallas: mappedTallas
          };
        });

        // Recopilar todas las tallas únicas para las opciones del filtro de talla (si lo implementas)
        this.opcionesTalla = [...new Set(this.productos.flatMap(p => p.tallas.map(t => t.size)))].sort();

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
        this.errorMessage = 'No se pudieron cargar los productos. Intenta de nuevo más tarde.';
        this.isLoading = false;
      }
    });
  }

  cargarOpcionesFiltro(): void {
    // Estas llamadas API deben devolver un array de objetos con una propiedad 'nombre' (o el nombre de la propiedad real)
    this.userService.obtener_modelo().subscribe({
      next: (data: any[]) => this.opcionesModelo = [...new Set(data.map(item => item.nombre).filter(n => n))],
      error: (err) => console.error('Error al cargar modelos:', err)
    });
    this.userService.obtener_diseno().subscribe({
      next: (data: any[]) => this.opcionesDiseno = [...new Set(data.map(item => item.nombre).filter(n => n))],
      error: (err) => console.error('Error al cargar diseños:', err)
    });
    this.userService.obtener_telas().subscribe({
      next: (data: any[]) => this.opcionesTela = [...new Set(data.map(item => item.disenoColor).filter(n => n))],
      error: (err) => console.error('Error al cargar telas:', err)
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

  // Usa el _id del producto como clave, si no existe, usa el índice
  toggleTallas(itemId: string | number): void {
    const id = itemId.toString();
    this.tallasVisibles[id] = !this.tallasVisibles[id];
  }

  onProductoGuardado(producto: any): void {
    console.log('onProductoGuardado called', producto);

    const mappedTallas: TallaItem[] = (producto.tallas || []).map((t: any) => ({
      // Usamos 'size' o 'talla' para el nombre de la talla
      size: (t.size || t.talla)?.toString() || 'N/A', // Convertir a string y manejar nulos
      // Usamos 'quantity' o 'cantidad' para la cantidad, asegurando que sea un número
      quantity: typeof (t.quantity || t.cantidad) === 'number' ? (t.quantity || t.cantidad) : 0
    }));

    const mappedProducto = {
      ...producto,
      tallas: mappedTallas,
      fechaEntrada: producto.fechaEntrada ? new Date(producto.fechaEntrada).toLocaleDateString() : 'N/A'
    };

    this.productos.push(mappedProducto);
  }

  // --- GETTERS ACTUALIZADOS PARA TRABAJAR CON EL ARRAY 'tallas' ---

  get cantidadTotalInventario(): number {
    return this.productosFiltrados.reduce((total, producto) => {
      return total + producto.tallas.reduce((sumTallas, talla) => sumTallas + talla.quantity, 0);
    }, 0);
  }

  // Métodos para obtener la cantidad total de una talla específica (S, M, L, etc.)
  // Esto es útil para los recuadros de resumen de inventario fijos.
  private getCantidadTotalPorTalla(size: string): number {
    return this.productosFiltrados.reduce((total, producto) => {
      const tallaEncontrada = producto.tallas.find(t => t.size.toUpperCase() === size.toUpperCase());
      return total + (tallaEncontrada ? tallaEncontrada.quantity : 0);
    }, 0);
  }

  get cantidadTotalS(): number { return this.getCantidadTotalPorTalla('S'); }
  get cantidadTotalM(): number { return this.getCantidadTotalPorTalla('M'); }
  get cantidadTotalL(): number { return this.getCantidadTotalPorTalla('L'); }
  get cantidadTotalXS(): number { return this.getCantidadTotalPorTalla('XS'); }
  get cantidadTotalXL(): number { return this.getCantidadTotalPorTalla('XL'); }
  get cantidadTotalXXL(): number { return this.getCantidadTotalPorTalla('XXL'); }
  // Puedes añadir más getters si quieres para tallas numéricas o específicas (ej: cantidadTotal2()): number { return this.getCantidadTotalPorTalla('2'); }


  // Getter para los datos del gráfico de barras (dinámico para todas las tallas)
  get tallasParaGrafico(): { size: string; quantity: number; color: string }[] {
    const tallasMap: { [key: string]: number } = {};

    this.productosFiltrados.forEach(producto => {
      producto.tallas.forEach(talla => {
        const size = talla.size.toUpperCase(); // Asegura consistencia (S vs s)
        tallasMap[size] = (tallasMap[size] || 0) + talla.quantity;
      });
    });

    // Ordenar las tallas para el gráfico (puedes personalizar este orden)
    const order = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2', '4', '6', '8', '10', '12', '14', '16'];

    const sortedTallas = Object.keys(tallasMap).sort((a, b) => {
      const indexA = order.indexOf(a);
      const indexB = order.indexOf(b);

      if (indexA !== -1 && indexB !== -1) {
        return indexA - indexB; // Ambos están en el orden predefinido
      }
      if (indexA !== -1) return -1; // Solo 'a' está en el orden, 'a' va primero
      if (indexB !== -1) return 1;  // Solo 'b' está en el orden, 'b' va primero

      // Si ninguno está en el orden predefinido, ordenar alfabéticamente
      return a.localeCompare(b);
    }).map(size => {
      // Asigna colores basados en algunas tallas comunes, puedes expandir esto
      let color = 'bg-gray-400'; // Color por defecto
      switch (size) {
        case 'S': color = 'bg-black'; break;
        case 'M': color = 'bg-gray-700'; break;
        case 'L': color = 'bg-gray-400'; break;
        case 'XS': color = 'bg-gray-600'; break;
        case 'XL': color = 'bg-gray-300'; break;
        case 'XXL': color = 'bg-gray-200'; break;
        // Puedes añadir más casos para otras tallas numéricas o alfanuméricas
        // case '2': color = 'bg-blue-500'; break;
      }
      return { size, quantity: tallasMap[size], color };
    });

    return sortedTallas;
  }

  get Math(): typeof Math {
    return Math;
  }

  // Método para filtrar productos basado en la búsqueda y filtros de modelo, diseño, tela
  get productosFiltrados(): ProductoInventario[] {
    let productosFiltrados = [...this.productos];

    // Filtrar por término de búsqueda (modelo, diseño, tela, y tallas)
    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.modelo.toLowerCase().includes(termino) ||
        producto.diseno.toLowerCase().includes(termino) ||
        producto.tela.toLowerCase().includes(termino) ||
        // Buscar en las tallas también
        producto.tallas.some(talla => talla.size.toLowerCase().includes(termino))
      );
    }

    // Filtrar por modelo
    if (this.modeloFiltro) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.modelo === this.modeloFiltro
      );
    }

    // Filtrar por diseño
    if (this.disenoFiltro) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.diseno === this.disenoFiltro
      );
    }

    // Filtrar por tela
    if (this.telaFiltro) {
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.tela === this.telaFiltro
      );
    }

    return productosFiltrados;
  }

  // Método para limpiar filtros
  limpiarFiltros(): void {
    this.modeloFiltro = '';
    this.disenoFiltro = '';
    this.telaFiltro = '';
    this.terminoBusqueda = '';
  }
}
