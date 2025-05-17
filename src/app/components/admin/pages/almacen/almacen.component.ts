import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Importa CommonModule para *ngIf y *ngFor
import { FormsModule } from '@angular/forms'; // Importa FormsModule si usas ngModel para los campos del formulario

@Component({
  selector: 'app-almacen',
  standalone: true,
  imports: [CommonModule, FormsModule], // Añade CommonModule y FormsModule aquí
  templateUrl: './almacen.component.html',
  styleUrls: ['./almacen.component.css'] // O usa 'styleUrl'
})
export class AlmacenComponent implements OnInit {

  modalAbierto = false;
  // Propiedades para guardar los valores seleccionados en el modal
  modeloSeleccionado: string = '';
  disenoSeleccionado: string = '';
  telaSeleccionada: string = '';

  // Array para guardar las entradas de talla y cantidad para el modal
  sizeQuantities: { size: string, quantity: number }[] = [];
  // Propiedades para la funcionalidad "Agregar cantidad de tallas +" (ejemplo)
  nuevaTalla: string = '';
  nuevaCantidad: number = 0;


  constructor() { }

  ngOnInit(): void {
  }

  abrirModalAgregarProducto(): void {
    this.modalAbierto = true;
    // Reinicia los campos del formulario del modal al abrir
    this.modeloSeleccionado = '';
    this.disenoSeleccionado = '';
    this.telaSeleccionada = '';
    this.sizeQuantities = []; // Limpia las entradas de talla anteriores
    this.nuevaTalla = '';
    this.nuevaCantidad = 0;
  }

  cerrarModalAgregarProducto(): void {
    this.modalAbierto = false;
  }

  // Función de ejemplo para añadir talla y cantidad (necesitarás inputs para esto en el modal)
  agregarTallaCantidad(): void {
      // Agrega validación aquí si es necesario
      if (this.nuevaTalla && this.nuevaCantidad > 0) {
          this.sizeQuantities.push({ size: this.nuevaTalla.toUpperCase(), quantity: this.nuevaCantidad });
          // Limpia los inputs después de añadir
          this.nuevaTalla = '';
          this.nuevaCantidad = 0;
      }
  }


  guardarProducto(): void {
    // Implementa tu lógica para guardar aquí
    // Puedes acceder a los valores seleccionados (this.modeloSeleccionado, etc.)
    // y las cantidades por talla (this.sizeQuantities)
    console.log('Guardando producto:', {
      modelo: this.modeloSeleccionado,
      diseno: this.disenoSeleccionado,
      tela: this.telaSeleccionada,
      tallas: this.sizeQuantities
    });
    // Después de guardar, cierra el modal
    this.cerrarModalAgregarProducto();
  }
}