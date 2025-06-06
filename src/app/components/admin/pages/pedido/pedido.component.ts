// pedido.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../../../../services/user.service';

interface Producto {
  id: string;
  nombre: string;
  modelo: string;
  diseno: string;
  tela: string;
  cantidadInventario: number; // ✅ Nombre correcto según tu backend
  tonalidad?: string; // ✅ Opcional por si no está en todos los productos
  tallas: {
    talla: string;
    cantidad: number;
  }[];
  precio: number;
  categoria: string;
  descripcion: string;
  imagenes: string[];
}

interface ItemCarrito extends Producto {
  cantidad: number;
}

interface Pedido {
  id: number;
  fecha: string;
  estado: string;
  items: {
    nombre: string;
    cantidad: number;
    precio: number;
  }[];
  total: number;
}

@Component({
  selector: 'app-pedido',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pedido.component.html',
  styleUrls: ['./pedido.component.css']
})
export class PedidoComponent implements OnInit {
  activeTab: string = 'productos';
  mostrarNuevoPedido: boolean = false;
  carrito: ItemCarrito[] = [];
  productos: Producto[] = [];

  pedidos: Pedido[] = [
    {
      id: 1001,
      fecha: "2025-06-05",
      estado: "Completado",
      items: [
        { nombre: "Camisa Elegante", cantidad: 2, precio: 79.99 }
      ],
      total: 159.98
    },
    {
      id: 1002,
      fecha: "2025-06-06",
      estado: "Pendiente",
      items: [
        { nombre: "Vestido Casual", cantidad: 1, precio: 129.99 },
        { nombre: "Blusa Floral", cantidad: 1, precio: 65.99 }
      ],
      total: 195.98
    }
  ];

  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.cargarProductos();
  }

  // Getters
  get totalCarrito(): number {
    return this.carrito.reduce((total, item) => total + (item.precio * item.cantidad), 0);
  }

  // Métodos para manejar tabs
  cambiarTab(tab: string): void {
    this.activeTab = tab;
  }

  // ✅ Método corregido para cargar productos
  cargarProductos(): void {
    console.log('Iniciando carga de productos...');

    this.userService.obtener_productos().subscribe({
      next: (data) => {
        console.log('Datos recibidos del servidor:', data);

        if (!data || !Array.isArray(data)) {
          console.error('Los datos recibidos no son un array válido:', data);
          return;
        }

        this.productos = data.map((item: any) => {
          if (!item._id || !item.nombre) {
            console.warn('Producto con datos incompletos:', item);
            return null;
          }

          return {
            id: item._id || item.id,
            nombre: item.nombre || 'Sin nombre',
            modelo: item.modelo || 'Sin modelo',
            diseno: item.diseno || 'Sin diseño',
            tela: item.tela || 'Sin tela',
            cantidadInventario: item.cantidadInventario || 0, // ✅ Nombre correcto
            tonalidad: item.tonalidad || 'Sin tonalidad', // ✅ Con valor por defecto
            tallas: Array.isArray(item.tallas) ? item.tallas : [],
            precio: parseFloat(item.precio) || 0,
            categoria: item.categoria || 'Sin categoría',
            descripcion: item.descripcion || 'Sin descripción',
            imagenes: Array.isArray(item.imagenes) ? item.imagenes : []
          };
        }).filter(producto => producto !== null);

        console.log('Productos procesados:', this.productos);
        console.log(`Total de productos cargados: ${this.productos.length}`);
      },
      error: (error) => {
        console.error('Error completo al obtener productos:', error);

        if (error.status) {
          console.error(`Error HTTP ${error.status}: ${error.statusText}`);
        }

        if (error.error && error.error.message) {
          console.error('Mensaje del servidor:', error.error.message);
        }
      }
    });
  }

  // ✅ Método para obtener stock total considerando las tallas
  getTotalStock(producto: Producto): number {
    if (!producto.tallas || !Array.isArray(producto.tallas) || producto.tallas.length === 0) {
      return producto.cantidadInventario || 0;
    }

    return producto.tallas.reduce((total, talla) => total + (talla.cantidad || 0), 0);
  }

  // Métodos para el carrito
  agregarAPedido(producto: Producto): void {
    const itemExistente = this.carrito.find(item => item.id === producto.id);
    if (itemExistente) {
      itemExistente.cantidad += 1;
    } else {
      this.carrito.push({
        ...producto,
        cantidad: 1
      });
    }
    this.activeTab = 'pedidos';
  }

  removerDelCarrito(productId: string): void {
    this.carrito = this.carrito.filter(item => item.id !== productId);
  }

  procesarPedido(): void {
    if (this.carrito.length === 0) return;

    const nuevoPedido: Pedido = {
      id: this.pedidos.length + 1001,
      fecha: new Date().toISOString().split('T')[0],
      estado: "Pendiente",
      items: this.carrito.map(item => ({
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: item.precio
      })),
      total: this.totalCarrito
    };

    this.pedidos.unshift(nuevoPedido);
    this.carrito = [];
    alert('Pedido procesado exitosamente!');
  }

  // Método para mostrar nuevo pedido
  toggleNuevoPedido(): void {
    this.mostrarNuevoPedido = !this.mostrarNuevoPedido;
  }

  // ✅ Métodos corregidos para usar getTotalStock
  getStockClass(producto: Producto): string {
    const stockTotal = this.getTotalStock(producto);
    return stockTotal > 10 ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800';
  }

  getStockText(producto: Producto): string {
    const stockTotal = this.getTotalStock(producto);
    return stockTotal > 10 ? 'En Stock' : 'Poco Stock';
  }

  // Método para obtener clase de estado de pedido
  getPedidoEstadoClass(estado: string): string {
    switch(estado) {
      case 'Completado':
        return 'bg-green-100 text-green-800';
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  }
}
