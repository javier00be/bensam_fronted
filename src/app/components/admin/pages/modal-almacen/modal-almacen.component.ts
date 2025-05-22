import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface SizeQuantity {
  size: string;
  quantity: number;
}

@Component({
  selector: 'app-modal-almacen',
   imports: [CommonModule, FormsModule],
  templateUrl: './modal-almacen.component.html',
  styleUrls: ['./modal-almacen.component.css']
})
export class ModalAlmacenComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() productSaved = new EventEmitter<any>();

  modeloSeleccionado = '';
  disenoSeleccionado = '';
  telaSeleccionada = '';
  nuevaTalla = '';
  nuevaCantidad: number | null = null;
  sizeQuantities: SizeQuantity[] = [];

  // Estados del modal
  isLoading = false;
  showError = false;

  cerrarModal() {
    this.showError = false;
    this.limpiarFormulario();
    this.closeModal.emit();
  }

  eliminarTalla(index: number) {
    this.sizeQuantities.splice(index, 1);
  }

  agregarTallaCantidad() {
    if (this.nuevaTalla && this.nuevaCantidad && this.nuevaCantidad > 0) {
      // Verificar si ya existe esa talla
      const existingIndex = this.sizeQuantities.findIndex(item => item.size === this.nuevaTalla);

      if (existingIndex >= 0) {
        // Si existe, sumar la cantidad
        this.sizeQuantities[existingIndex].quantity += this.nuevaCantidad;
      } else {
        // Si no existe, agregar nueva entrada
        this.sizeQuantities.push({
          size: this.nuevaTalla,
          quantity: this.nuevaCantidad
        });
      }

      // Limpiar campos
      this.nuevaTalla = '';
      this.nuevaCantidad = null;
    }
  }

  guardarProducto() {
    this.showError = false;

    if (this.modeloSeleccionado && this.disenoSeleccionado && this.telaSeleccionada && this.sizeQuantities.length > 0) {
      this.isLoading = true;

      // Simular delay de guardado
      setTimeout(() => {
        const producto = {
          modelo: this.modeloSeleccionado,
          diseno: this.disenoSeleccionado,
          tela: this.telaSeleccionada,
          tallas: this.sizeQuantities,
          fecha: new Date().toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
          })
        };

        this.productSaved.emit(producto);
        this.isLoading = false;
        this.cerrarModal();
      }, 1000);
    } else {
      this.showError = true;
    }
  }

  private limpiarFormulario() {
    this.modeloSeleccionado = '';
    this.disenoSeleccionado = '';
    this.telaSeleccionada = '';
    this.nuevaTalla = '';
    this.nuevaCantidad = null;
    this.sizeQuantities = [];
    this.isLoading = false;
    this.showError = false;
  }
}
