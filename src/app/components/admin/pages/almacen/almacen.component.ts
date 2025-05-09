import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-almacen',
  standalone: true,  // Marca el componente como independiente
  imports: [RouterModule],
  templateUrl: './almacen.component.html',
  styleUrls: ['./almacen.component.css']
})
export class AlmacenComponent {
  // Lógica de tu componente almacen
}
