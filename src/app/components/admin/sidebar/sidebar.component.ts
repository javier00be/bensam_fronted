import { Component } from '@angular/core';
import { RouterLink, RouterModule } from '@angular/router';
import { AlmacenComponent } from '../pages/almacen/almacen.component';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, AlmacenComponent],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css',
})
export class SidebarComponent {}
