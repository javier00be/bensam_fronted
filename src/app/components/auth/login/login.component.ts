import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// Otros imports necesarios

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule], // Añade otros módulos que necesites
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  // Tu código aquí
}
