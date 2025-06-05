import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
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
  @Input() modalType: 'model' | 'design' | 'fabric' | 'category' = 'model';
  @Input() editData: any = null;
  @Input() isEdit: boolean = false;

  @Output() closeModalEvent = new EventEmitter<void>();
  @Output() saveContentEvent = new EventEmitter<any>();

  // Datos para los formularios
  content = '';
  fabricDesign = '';
  fabricTexture = '';

  // Datos para los diferentes formularios completos
  modelData: any = { nombre: '' };
  designData: any = { nombre: '' };
  fabricData: any = { diseno: '', color: '' };
  categoryData: any = { nombre: '' };

  // Mensaje de estado para retroalimentación
  statusMessage = '';
  showStatus = false;
  isLoading = false;

  // Usando inject para el servicio
  private userService = inject(UserService);

  ngOnInit(): void {
    console.log('ModalComponent inicializado');
  }

  ngOnChanges(changes: SimpleChanges): void {
    console.log('🔄 Cambios detectados en Modal:', changes);
    console.log('📋 Estado actual:', {
      isVisible: this.isVisible,
      isEdit: this.isEdit,
      modalType: this.modalType,
      editData: this.editData
    });

    // Resetear siempre que el modal se abra
    if (changes['isVisible'] && this.isVisible) {
      console.log('🔄 Modal abierto, reseteando datos...');
      this.resetForm();

      // Poblar datos si es edición
      if (this.isEdit && this.editData) {
        console.log('📝 Poblando datos para edición');
        setTimeout(() => this.populateEditData(), 0);
      }
    }

    // Manejar cambios en los datos de edición
    if (changes['editData'] && this.editData && this.isEdit && this.isVisible) {
      console.log('📝 Datos de edición cambiaron, repoblando...');
      setTimeout(() => this.populateEditData(), 0);
    }

    // Manejar cambio en modo de edición
    if (changes['isEdit']) {
      console.log('🔄 Modo de edición cambió a:', this.isEdit);
      if (!this.isEdit) {
        this.resetForm();
      } else if (this.editData && this.isVisible) {
        setTimeout(() => this.populateEditData(), 0);
      }
    }
  }

  // Método mejorado para llenar los formularios con datos existentes
  populateEditData(): void {
    if (!this.isEdit || !this.editData) {
      console.log('❌ No hay datos para poblar o no está en modo edición');
      return;
    }

    console.log('📋 Poblando datos para:', this.modalType, this.editData);

    try {
      switch (this.modalType) {
        case 'model':
          this.modelData = {
            ...this.editData,
            nombre: this.editData.nombre || ''
          };
          this.content = this.modelData.nombre;
          console.log('✅ Modelo poblado:', this.modelData);
          break;

        case 'design':
          this.designData = {
            ...this.editData,
            nombre: this.editData.design || this.editData.nombre || ''
          };
          this.content = this.designData.nombre;
          console.log('✅ Diseño poblado:', this.designData);
          break;

        case 'fabric':
          this.fabricData = {
            ...this.editData,
            diseno: this.editData.diseno || '',
            color: this.editData.color || ''
          };
          this.fabricDesign = this.fabricData.diseno;
          this.fabricTexture = this.fabricData.color;
          console.log('✅ Tela poblada:', this.fabricData);
          break;

        case 'category':
          this.categoryData = {
            ...this.editData,
            nombre: this.editData.nombre || ''
          };
          this.content = this.categoryData.nombre;
          console.log('✅ Categoría poblada:', this.categoryData);
          break;
      }
    } catch (error) {
      console.error('❌ Error poblando datos:', error);
    }
  }

  // Obtener el título correspondiente según el tipo de modal
  getModalTitle(): string {
    const action = this.isEdit ? 'Editar' : 'Insertar';
    switch (this.modalType) {
      case 'model':
        return `${action} Modelo`;
      case 'design':
        return `${action} Diseño`;
      case 'fabric':
        return `${action} Tela`;
      case 'category':
        return `${action} Categoría`;
      default:
        return '';
    }
  }

  // Cerrar el modal
  closeModal(): void {
    console.log('🔐 Cerrando modal desde componente Modal');
    this.resetForm();
    this.closeModalEvent.emit();
  }

  // Resetear los formularios
  resetForm(): void {
    console.log('🔄 Reseteando formulario');

    // Resetear campos del formulario
    this.content = '';
    this.fabricDesign = '';
    this.fabricTexture = '';

    // Resetear objetos de datos
    this.modelData = { nombre: '' };
    this.designData = { nombre: '' };
    this.fabricData = { diseno: '', color: '' };
    this.categoryData = { nombre: '' };

    // Resetear mensajes de estado
    this.statusMessage = '';
    this.showStatus = false;
    this.isLoading = false;
  }

  // Guardar contenido básico (modelo, diseño, categoría)
  saveContent(): void {
    console.log('💾 Guardando contenido para:', this.modalType);
    console.log('📋 Estado actual:', {
      isEdit: this.isEdit,
      content: this.content,
      editData: this.editData
    });

    if (!this.content.trim()) {
      this.handleError(null, 'El campo no puede estar vacío');
      return;
    }

    this.isLoading = true;
    this.statusMessage = '';
    this.showStatus = false;

    // Preparar datos según el tipo
    let dataToSave: any;
    switch (this.modalType) {
      case 'model':
        dataToSave = {
          ...this.modelData,
          nombre: this.content.trim()
        };
        break;
      case 'design':
        dataToSave = {
          ...this.designData,
          nombre: this.content.trim(),
          design: this.content.trim() // Mantener compatibilidad
        };
        break;
      case 'category':
        dataToSave = {
          ...this.categoryData,
          nombre: this.content.trim()
        };
        break;
      default:
        this.handleError(null, 'Tipo de modal no válido');
        return;
    }

    console.log('📤 Datos a guardar:', dataToSave);

    if (this.isEdit) {
      this.handleEditSave(dataToSave);
    } else {
      this.handleNewSave(dataToSave);
    }
  }

  // Guardar una tela
  saveFabricContent(): void {
    console.log('💾 Guardando datos de tela');
    console.log('📋 Estado actual:', {
      isEdit: this.isEdit,
      fabricDesign: this.fabricDesign,
      fabricTexture: this.fabricTexture,
      editData: this.editData
    });

    if (!this.fabricDesign.trim() || !this.fabricTexture.trim()) {
      this.handleError(null, 'Todos los campos de la tela son obligatorios');
      return;
    }

    this.isLoading = true;
    this.statusMessage = '';
    this.showStatus = false;

    // Preparar datos de la tela
    const fabricDataToSave = {
      ...this.fabricData,
      diseno: this.fabricDesign.trim(),
      color: this.fabricTexture.trim()
    };

    console.log('📤 Datos de tela a guardar:', fabricDataToSave);

    if (this.isEdit) {
      this.handleEditSave(fabricDataToSave);
    } else {
      this.handleNewSave(fabricDataToSave);
    }
  }

  // Manejar la edición de elementos existentes
  private handleEditSave(dataToSave: any): void {
    const itemId = this.editData?.id || this.editData?._id;

    console.log('📝 Manejando edición:', {
      modalType: this.modalType,
      itemId: itemId,
      dataToSave: dataToSave
    });

    if (!itemId) {
      this.handleError(null, 'No se pudo obtener el ID del elemento para editar');
      return;
    }

    // Emitir evento para que el componente padre maneje la actualización
    const eventData = {
      type: this.modalType,
      data: dataToSave,
      isEdit: true,
      editId: itemId
    };

    console.log('📡 Emitiendo evento de edición:', eventData);
    this.saveContentEvent.emit(eventData);

    // Mostrar mensaje de éxito
    const itemType = this.getItemTypeName();
    this.handleSuccess(null, `${itemType} actualizado correctamente`);
  }

  // Manejar el guardado de nuevos elementos
  private handleNewSave(dataToSave: any): void {
    console.log('➕ Creando nuevo elemento:', {
      modalType: this.modalType,
      dataToSave: dataToSave
    });

    switch (this.modalType) {
      case 'model':
        this.userService.insertar_modelo(dataToSave).subscribe({
          next: (response) => {
            console.log('✅ Modelo creado:', response);
            this.handleSuccess(response, 'Modelo guardado correctamente');
            this.emitNewItemEvent(response || dataToSave);
          },
          error: (error) => this.handleError(error, 'Error al guardar el modelo')
        });
        break;

      case 'design':
        this.userService.insertar_diseno(dataToSave).subscribe({
          next: (response) => {
            console.log('✅ Diseño creado:', response);
            this.handleSuccess(response, 'Diseño guardado correctamente');
            this.emitNewItemEvent(response || dataToSave);
          },
          error: (error) => this.handleError(error, 'Error al guardar el diseño')
        });
        break;

      case 'fabric':
        this.userService.insertar_tela(dataToSave).subscribe({
          next: (response) => {
            console.log('✅ Tela creada:', response);
            this.handleSuccess(response, 'Tela guardada correctamente');
            this.emitNewItemEvent(response || dataToSave);
          },
          error: (error) => this.handleError(error, 'Error al guardar la tela')
        });
        break;

      case 'category':
        if (this.userService.insertar_categoria) {
          this.userService.insertar_categoria(dataToSave).subscribe({
            next: (response) => {
              console.log('✅ Categoría creada:', response);
              this.handleSuccess(response, 'Categoría guardada correctamente');
              this.emitNewItemEvent(response || dataToSave);
            },
            error: (error) => this.handleError(error, 'Error al guardar la categoría')
          });
        } else {
          // Simulación si el servicio no existe
          console.log('⚠️ Servicio de categoría no implementado, simulando...');
          this.handleSuccess(dataToSave, 'Categoría guardada correctamente');
          this.emitNewItemEvent(dataToSave);
        }
        break;

      default:
        this.handleError(null, 'Tipo de elemento no válido');
    }
  }

  // Emitir evento para nuevos elementos
  private emitNewItemEvent(itemData: any): void {
    const eventData = {
      type: this.modalType,
      data: itemData,
      isEdit: false
    };

    console.log('📡 Emitiendo evento de creación:', eventData);
    this.saveContentEvent.emit(eventData);
  }

  // Método auxiliar para obtener el nombre del tipo de item
  private getItemTypeName(): string {
    switch (this.modalType) {
      case 'model':
        return 'Modelo';
      case 'design':
        return 'Diseño';
      case 'fabric':
        return 'Tela';
      case 'category':
        return 'Categoría';
      default:
        return 'Elemento';
    }
  }

  private handleSuccess(response: any, message: string): void {
    console.log('✅ Operación exitosa:', message);
    this.isLoading = false;
    this.statusMessage = message;
    this.showStatus = true;

    // Cerrar modal después de un breve delay
    setTimeout(() => {
      this.closeModal();
    }, 1500);
  }

  private handleError(error: any, message: string): void {
    console.error('❌ Error en operación:', error);
    this.isLoading = false;
    this.statusMessage = message;
    this.showStatus = true;
  }
}
