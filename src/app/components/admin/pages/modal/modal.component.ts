import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-modal',
  templateUrl: './modal.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
})
export class ModalComponent implements OnInit, OnChanges {
  @Input() isVisible: boolean = false;
  @Input() modalType: 'model' | 'design' | 'fabric' = 'model';
  @Input() editData: any = null;
  @Input() isEdit: boolean = false;

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() saveContentEvent = new EventEmitter<any>();

  // Datos para los formularios simples
  content = '';
  fabricDesign = '';
  fabricTexture = '';

  // Datos para los diferentes formularios completos
  modelData: any = { nombre: '' };
  designData: any = { nombre: '' };
  fabricData: any = { diseno: '', color: '' };

  // Mensaje de estado para retroalimentación
  statusMessage = '';
  showStatus = false;
  isLoading = false;

  // Usando inject para el servicio
  private userService = inject(UserService);

  ngOnInit(): void {
    // Inicialización básica
    console.log('ModalComponent inicializado');
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Si cambia el modo de edición y los datos de edición, actualizamos los formularios
    if ((changes['editData'] && changes['editData'].currentValue) ||
        (changes['isEdit'] && changes['isEdit'].currentValue)) {
      console.log('Cambios detectados en editData o isEdit:', changes);
      this.populateEditData();
    }
  }

  // Método para llenar los formularios con datos existentes cuando estamos en modo edición
  populateEditData(): void {
    if (this.isEdit && this.editData) {
      console.log('Cargando datos para edición:', this.editData);

      switch(this.modalType) {
        case 'model':
          this.modelData = { ...this.editData };
          this.content = this.modelData.nombre || '';
          break;
        case 'design':
          this.designData = { ...this.editData };
          // Asegurarse de que usamos el campo correcto
          if (this.designData.design && !this.designData.nombre) {
            this.designData.nombre = this.designData.design;
          }
          this.content = this.designData.nombre || '';
          break;
        case 'fabric':
          this.fabricData = { ...this.editData };
          this.fabricDesign = this.fabricData.diseno || '';
          this.fabricTexture = this.fabricData.color || '';
          break;
      }
    }
  }

  // Obtener el título correspondiente según el tipo de modal
  getModalTitle(): string {
    const action = this.isEdit ? 'Editar' : 'Insertar';
    switch(this.modalType) {
      case 'model': return `${action} Modelo`;
      case 'design': return `${action} Diseño`;
      case 'fabric': return `${action} Tela`;
      default: return '';
    }
  }

  // Cerrar el modal
  closeModal(): void {
    this.resetForm();
    this.closeModalEvent.emit();
  }

  // Resetear los formularios
  resetForm(): void {
    this.content = '';
    this.fabricDesign = '';
    this.fabricTexture = '';
    this.statusMessage = '';
    this.showStatus = false;

    this.modelData = { nombre: '' };
    this.designData = { nombre: '' };
    this.fabricData = { diseno: '', color: '' };
  }

  // Guardar contenido básico (modelo o diseño)
  saveContent(): void {
    console.log('Guardando contenido para:', this.modalType);
    this.isLoading = true;

    // Sincronizar el contenido con los objetos de datos
    if (this.modalType === 'model') {
      this.modelData.nombre = this.content;
    } else if (this.modalType === 'design') {
      this.designData.nombre = this.content;
    }

    if (this.isEdit) {
      this.handleEditSave();
    } else {
      this.handleNewSave();
    }
  }

  // Guardar una tela
  saveFabricContent(): void {
    console.log('Guardando datos de tela');
    this.isLoading = true;

    // Sincronizar los campos con el objeto de datos
    this.fabricData = {
      diseno: this.fabricDesign,
      color: this.fabricTexture,
      ...this.isEdit ? {id: this.editData?.id || this.editData?._id} : {}
    };

    if (this.isEdit) {
      console.log('Emitiendo evento para actualizar tela:', this.fabricData);
      this.saveContentEvent.emit({
        type: 'fabric',
        data: this.fabricData,
        isEdit: true
      });
      this.handleSuccess(null, 'Tela actualizada correctamente', this.fabricData);
    } else {
      this.userService.insertar_tela(this.fabricData).subscribe(
        (response) => {
          console.log('Respuesta de insertar_tela:', response);
          this.handleSuccess(response, 'Tela guardada correctamente', this.fabricData);
        },
        (error) => this.handleError(error, 'Error al guardar la tela')
      );
    }
  }

  // Manejar la edición de elementos existentes
  private handleEditSave(): void {
    let data: any;
    let itemId = this.editData?.id || this.editData?._id;

    console.log('Manejando edición para:', this.modalType, 'con ID:', itemId);

    switch(this.modalType) {
      case 'model':
        data = { ...this.modelData };
        break;
      case 'design':
        data = { ...this.designData };
        break;
      case 'fabric':
        data = { ...this.fabricData };
        break;
    }

    console.log('Emitiendo evento para actualizar:', data);

    this.saveContentEvent.emit({
      type: this.modalType,
      data: data,
      isEdit: true,
      editId: itemId
    });

    const itemType = this.getModalTitle().toLowerCase().replace('editar ', '');
    this.handleSuccess(null, `${itemType} actualizado correctamente`, data);
  }

  // Manejar el guardado de nuevos elementos
  private handleNewSave(): void {
    if (this.modalType === 'model') {
      console.log('Insertando nuevo modelo:', this.modelData);
      this.userService.insertar_modelo(this.modelData).subscribe(
        (response) => {
          console.log('Respuesta de insertar_modelo:', response);
          this.handleSuccess(response, 'Modelo guardado correctamente', this.modelData);
        },
        (error) => this.handleError(error, 'Error al guardar el modelo')
      );
    } else if (this.modalType === 'design') {
      console.log('Insertando nuevo diseño:', this.designData);
      this.userService.insertar_diseno(this.designData).subscribe(
        (response) => {
          console.log('Respuesta de insertar_diseno:', response);
          this.handleSuccess(response, 'Diseño guardado correctamente', this.designData);
        },
        (error) => this.handleError(error, 'Error al guardar el diseño')
      );
    }
  }

  private handleSuccess(response: any, message: string, savedData: any): void {
    this.isLoading = false;
    this.statusMessage = message;
    this.showStatus = true;
    console.log('Operación exitosa:', response || savedData);

    // Emitir el contenido guardado al componente padre si no es edición
    // (para edición ya se emitió en handleEditSave)
    if (!this.isEdit) {
      console.log('Emitiendo evento de contenido guardado:', {
        type: this.modalType,
        data: savedData,
        response: response,
      });

      this.saveContentEvent.emit({
        type: this.modalType,
        data: savedData,
        response: response,
      });
    }

    // Cerrar el modal después de 1.5 segundos para mostrar el mensaje
    setTimeout(() => {
      this.closeModal();
    }, 1500);
  }

  private handleError(error: any, message: string): void {
    this.isLoading = false;
    this.statusMessage = message;
    this.showStatus = true;
    console.error('Error en la operación:', error);
  }
}
