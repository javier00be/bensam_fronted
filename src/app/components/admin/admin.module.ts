import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';  // Importa las rutas
import { RouterModule } from '@angular/router'; // Importa RouterModule para usar router-outlet

@NgModule({
  declarations: [
    // Elimina AlmacenComponent de aquí, ya que es standalone
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,  // Importa el módulo de rutas
    RouterModule,  // Asegúrate de importar RouterModule
  ]
})
export class AdminModule { }
