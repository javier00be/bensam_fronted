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
    { icon: 'fas fa-truck', text: 'Free Shipping' },
    { icon: 'fas fa-undo-alt', text: '30 Days Return' },
    { icon: 'fas fa-exchange-alt', text: 'Free Exchange' },
    { icon: 'fas fa-headset', text: '24/7 Support' }
  ];

  constructor() { }

}
