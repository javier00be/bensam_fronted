import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
// Importa tus otros componentes según sea necesario

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige la ruta raíz a login si lo deseas
  { path: 'login', component: LoginComponent },
  // Agrega tus otras rutas aquí
];
