import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-header',
  standalone: true, // Indica que este componente es independiente y no necesita un módulo específico
  templateUrl: './header.component.html', // Referencia al archivo HTML separado
  imports: [CommonModule,           // Para *ngIf
    ReactiveFormsModule], // Aquí puedes importar otros módulos de Angular si es necesario
  styleUrls: [] // Puedes añadir archivos CSS específicos aquí si los necesitas, pero Tailwind maneja la mayoría del estilo
})
export class HeaderComponent implements OnInit {
  cartItemCount: number = 0; // Ejemplo: contador dinámico de elementos en el carrito
  activeCategory: string = 'formal'; // Rastrea la categoría principal activa
  showSubMenu: boolean = false; // Controla la visibilidad del submenú formal para escritorio
  isMobileMenuOpen: boolean = false; // Controla la visibilidad del menú de hamburguesa para móvil
  isFormalMobileSubMenuOpen: boolean = false; // Controla la visibilidad del submenú formal para móvil

  formalSubCategories: string[] = [
    'TERNOS',
    'CAMISAS',
    'SACOS',
    'PANTALONES',
    'CORBATAS',
    'CALZADO VESTIR / CASUAL',
    'VER TODO'
  ];

  constructor() { }

  ngOnInit(): void {
    // Inicializa cualquier dato aquí, por ejemplo, obtener elementos del carrito
  }

  setActiveCategory(category: string): void {
    this.activeCategory = category;
    // En una aplicación real, podrías activar una navegación o carga de datos aquí
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    // Cierra el submenú formal si se abre el menú principal
    if (this.isMobileMenuOpen) {
      this.isFormalMobileSubMenuOpen = false;
    }
  }

  toggleFormalMobileSubMenu(): void {
    this.isFormalMobileSubMenuOpen = !this.isFormalMobileSubMenuOpen;
  }
}
