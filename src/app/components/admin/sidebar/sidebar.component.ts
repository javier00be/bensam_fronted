import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
})
export class SidebarComponent {
  // Definir navItems correctamente
  navItems = [
    { name: 'Dashboard', icon: 'fa-th-large', route: '/admin/home/' },
    { name: 'Almacen', icon: 'fa-book-open', route: '/admin/almacen' },
    { name: 'Producto', icon: 'fa-shield-alt', route: '/admin/producto' },
    { name: 'Material', icon: 'fa-chart-line', route: '/admin/material' },
    { name: 'Pedidos', icon: 'fa-users', route: '/admin/pedido' },
  ];

  // Método para obtener clases de gradiente basadas en el índice
  getGradientClass(index: number): string {
    const gradients = [
      'from-blue-500 to-blue-600',      // Dashboard
      'from-green-500 to-green-600',    // Almacen
      'from-purple-500 to-purple-600',  // Producto
      'from-orange-500 to-orange-600',  // Material
      'from-red-500 to-red-600',        // Pedidos
    ];

    return gradients[index] || 'from-gray-500 to-gray-600';
  }
}
