import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AlmacenComponent } from './pages/almacen/almacen.component';  // Componente de Almacen
import { HomeComponent } from './pages/home/home.component';

const routes: Routes = [
  { path: 'almacen', component: AlmacenComponent },  // Ruta para el componente Almacen
  { path: 'home', component: HomeComponent },    // Ruta para el componente Kanban
  { path: '', redirectTo: '/almacen', pathMatch: 'full' } // Ruta por defecto (redirige a Almacen)
];

@NgModule({
  imports: [RouterModule.forChild(routes)],  // Usa forChild si es un módulo hijo
  exports: [RouterModule]
})
export class AdminRoutingModule { }
