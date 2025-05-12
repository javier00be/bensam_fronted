import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'home',
    loadComponent: () => import('../admin/pages/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'almacen',
    loadComponent: () => import('../admin/pages/almacen/almacen.component').then(m => m.AlmacenComponent)
  },
  {
    path: 'producto',
    loadComponent: () => import('../admin/pages/producto/producto.component').then(m => m.ProductoComponent)
  },
  {
    path: 'material',
    loadComponent: () => import('../admin/pages/material/material.component').then(m => m.MaterialComponent)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
