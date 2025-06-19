import { Component } from '@angular/core';

@Component({
  selector: 'app-footer', // Puedes usar este selector en tus plantillas HTML
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css'] // Si necesitas estilos CSS adicionales no cubiertos por Tailwind
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  constructor() { }
}

