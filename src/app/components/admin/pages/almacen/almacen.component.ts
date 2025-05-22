import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalAlmacenComponent } from '../modal-almacen/modal-almacen.component';

// Interfaz para los datos del producto
interface ProductoInventario {
  modelo: string;
  diseno: string;
  tela: string;
  cantidadS: number;
  cantidadM: number;
  cantidadL: number;
  fecha: string;
}

@Component({
  selector: 'app-almacen',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalAlmacenComponent], // Add ModalAlmacenComponent here
  templateUrl: './almacen.component.html',
  styleUrls: ['./almacen.component.css']
})
export class AlmacenComponent implements OnInit {

  // Control del modal
  modalAbierto = false;

  // Datos del inventario
  productos: ProductoInventario[] = [
    {
      modelo: 'Clásico',
      diseno: 'Machete',
      tela: 'D4032',
      cantidadS: 3,
      cantidadM: 1,
      cantidadL: 2,
      fecha: '01/03/2025'
    },
    {
        modelo: 'Moderno',
        diseno: 'Liso',
        tela: 'C2015',
        cantidadS: 1,
        cantidadM: 2,
        cantidadL: 0,
        fecha: '15/02/2025'
    },
    {
        modelo: 'Deportivo',
        diseno: 'Estampado',
        tela: 'P1089',
        cantidadS: 0,
        cantidadM: 2,
        cantidadL: 3,
        fecha: '10/01/2025'
    }
  ];

  // Propiedades para el formulario de filtros
  modeloFiltro: string = '';
  disenoFiltro: string = '';
  telaFiltro: string = '';

  // Propiedad para la búsqueda
  terminoBusqueda: string = '';

  // Opciones para los selectores
  opcionesModelo: string[] = ['Clásico', 'Moderno', 'Deportivo'];
  opcionesDiseno: string[] = ['Machete', 'Liso', 'Estampado'];
  opcionesTela: string[] = ['D4032', 'C2015', 'P1089'];

  constructor() { }

  ngOnInit(): void {
    // Inicialización del componente
  }

  // Método para abrir el modal
  abrirModal(): void {
    this.modalAbierto = true;
  }

  // Método para cerrar el modal
  cerrarModal(): void {
    this.modalAbierto = false;
  }

  // Método para manejar cuando se guarda un producto desde el modal
  onProductoGuardado(producto: any): void {
    // Inicializar cantidades de talla a 0
    const cantidadesTalla = {
      cantidadS: 0,
      cantidadM: 0,
      cantidadL: 0,
      // Add other sizes if needed
      cantidadXS: 0,
      cantidadXL: 0,
      cantidadXXL: 0
    };

    // Asignar cantidades desde el array de tallas
    producto.tallas.forEach((tallaItem: { size: string; quantity: number; }) => {
      switch (tallaItem.size) {
        case 'S':
          cantidadesTalla.cantidadS = tallaItem.quantity;
          break;
        case 'M':
          cantidadesTalla.cantidadM = tallaItem.quantity;
          break;
        case 'L':
          cantidadesTalla.cantidadL = tallaItem.quantity;
          break;
        case 'XS':
            cantidadesTalla.cantidadXS = tallaItem.quantity;
            break;
        case 'XL':
            cantidadesTalla.cantidadXL = tallaItem.quantity;
            break;
        case 'XXL':
            cantidadesTalla.cantidadXXL = tallaItem.quantity;
            break;
      }
    });

    const nuevoProducto: ProductoInventario = {
      modelo: producto.modelo,
      diseno: producto.diseno,
      tela: producto.tela,
      cantidadS: cantidadesTalla.cantidadS,
      cantidadM: cantidadesTalla.cantidadM,
      cantidadL: cantidadesTalla.cantidadL,
      fecha: producto.fecha // Use the date from the modal, or generate if not provided
    };

    this.productos.push(nuevoProducto);
    this.cerrarModal();
  }

  // Getter para obtener la cantidad total en inventario de los productos filtrados
  get cantidadTotalInventario(): number {
    return this.productosFiltrados.reduce((total, producto) => {
      return total + producto.cantidadS + producto.cantidadM + producto.cantidadL;
    }, 0);
  }

  // Getter para obtener cantidad total por talla de los productos filtrados
  get cantidadTotalS(): number {
    return this.productosFiltrados.reduce((total, producto) => total + producto.cantidadS, 0);
  }

  get cantidadTotalM(): number {
    return this.productosFiltrados.reduce((total, producto) => total + producto.cantidadM, 0);
  }

  get cantidadTotalL(): number {
    return this.productosFiltrados.reduce((total, producto) => total + producto.cantidadL, 0);
  }

  // Método para filtrar productos basado en la búsqueda y filtros
  get productosFiltrados(): ProductoInventario[] {
    let productosFiltrados = [...this.productos];

    // Filtrar por término de búsqueda
    if (this.terminoBusqueda) {
      const termino = this.terminoBusqueda.toLowerCase();
      productosFiltrados = productosFiltrados.filter(producto =>
        producto.modelo.toLowerCase().includes(termino) ||
        producto.diseno.toLowerCase().includes(termino) ||
        producto.tela.toLowerCase().includes(termino)
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
