import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-features',
  imports: [
    CommonModule,           // Para *ngIf
    ReactiveFormsModule     // Para [formGroup] y reactive forms
  ],
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.css']
})
export class FeaturesComponent {

  features = [
    {
      icon: 'fas fa-star',
      title: 'Alta Calidad',
      description: 'Elaborado con materiales de primera'
    },
    {
      icon: 'fas fa-award',
      title: 'Protección de Garantía',
      description: 'Más de 2 años'
    },
    {
      icon: 'fas fa-box-open',
      title: 'Envío Gratis',
      description: 'Pedidos superiores a 300 S/.'
    },
    {
      icon: 'fas fa-headset',
      title: 'Soporte 24/7',
      description: 'Soporte dedicado'
    }
  ];

  constructor() { }

}
