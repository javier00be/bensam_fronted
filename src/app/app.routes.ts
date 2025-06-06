import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SidebarComponent } from './components/admin/sidebar/sidebar.component';
import { HomeComponent } from './components/admin/pages/home/home.component';
import { AlmacenComponent } from './components/admin/pages/almacen/almacen.component';
import { ProductoComponent } from './components/admin/pages/producto/producto.component';
import { MaterialComponent } from './components/admin/pages/material/material.component';
import { AdminComponent } from './components/admin/admin.component';
import { HomeComponent as EcommerceHomeComponent } from './components/ecommerce/home/home.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  {
    path: 'ecommerce',
    loadComponent: () =>
      import('../app/components/ecommerce/home/home.component').then(
        (m) => m.HomeComponent
      ),
  },
  {
    path: 'admin',
    component: AdminComponent,
    children: [
      {
        path: 'home',
        loadComponent: () =>
          import('../app/components/admin/pages/home/home.component').then(
            (m) => m.HomeComponent
          ),
      },
      {
        path: 'almacen',
        loadComponent: () =>
          import(
            '../app/components/admin/pages/almacen/almacen.component'
          ).then((m) => m.AlmacenComponent),
      },
      {
        path: 'producto',
        loadComponent: () =>
          import(
            '../app/components/admin/pages/producto/producto.component'
          ).then((m) => m.ProductoComponent),
      },
      {
        path: 'material',
        loadComponent: () =>
          import(
            '../app/components/admin/pages/material/material.component'
          ).then((m) => m.MaterialComponent),
      },
      {
        path: '',
        redirectTo: 'Dashboard',
        pathMatch: 'full',
      },
      {
        path: 'pedido',
        loadComponent: () =>
          import(
            '../app/components/admin/pages/pedido/pedido.component'
          ).then((m) => m.PedidoComponent),
      },
    ],
  },
];
