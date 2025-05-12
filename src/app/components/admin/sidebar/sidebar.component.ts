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
  ];
}
