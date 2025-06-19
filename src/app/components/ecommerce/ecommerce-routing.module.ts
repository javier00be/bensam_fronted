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
    loadComponent: () => import('../ecommerce/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'tienda',
    loadComponent: () => import('./tienda/tienda.component').then(m => m.TiendaComponent)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EcommerceRoutingModule { }
