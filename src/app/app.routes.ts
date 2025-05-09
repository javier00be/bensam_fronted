import { Routes } from '@angular/router';
import { LoginComponent } from './components/auth/login/login.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { SidebarComponent } from './components/admin/sidebar/sidebar.component';
// Importa tus otros componentes según sea necesario

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' }, // Redirige la ruta raíz a login si lo deseas
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'sidebar', component: SidebarComponent },
  // Agrega tus otras rutas aquí
];
