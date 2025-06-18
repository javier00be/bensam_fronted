import { Component } from '@angular/core';

@Component({
  selector: 'app-hero',
  templateUrl: './hero.component.html',
  styleUrls: ['./hero.component.css']
})
export class HeroComponent {

  constructor() { }

  viewCollection(): void {
    // Lógica para ver la colección
    console.log('Ver colección clickeado');
  }

}
