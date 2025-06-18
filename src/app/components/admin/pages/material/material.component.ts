import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component'; // Asegúrate que la ruta sea correcta
import { UserService } from '../../../../services/user.service'; // Asegúrate que la ruta sea correcta
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component'; // Asegúrate que la ruta sea correcta
import { forkJoin, Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

// Define interfaces para una mejor seguridad de tipos
interface Model {
  _id?: string;
  id?: string; // Para compatibilidad si el backend usa 'id' en lugar de '_id'
  nombre: string;
  createdAt: string | Date;
  // Añade otras propiedades específicas del modelo aquí
}

interface Design {
  _id?: string;
  id?: string;
  nombre?: string; // Usado como fallback en tu plantilla
  design?: string; // Asumo que es la propiedad principal del nombre
  createdAt: string | Date;
  // Añade otras propiedades específicas del diseño aquí
}

interface Fabric {
  _id?: string;
  id?: string;
  diseno: string; // Nombre del diseño/tipo de tela
  color: string;
  createdAt: string | Date;
  // Añade otras propiedades específicas de la tela aquí
}

interface Category {
  _id?: string;
  id?: string;
  nombre: string; // Nombre de la categoría
  createdAt: string | Date;
  // Añade otras propiedades específicas de la categoría aquí
}

interface Talla {
  _id?: string;
  id?: string;
  talla: string;
  createdAt: string | Date;
  // Añade otras propiedades específicas de la talla aquí
}

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    HttpClientModule,
    ConfirmationModalComponent,
  ],
  providers: [UserService],
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css'],
})
export class MaterialComponent implements OnInit, OnDestroy {
  activeTab: 'models' | 'designs' | 'fabrics' | 'categories' | 'tallas' = 'models';

  models: Model[] = [];
  designs: Design[] = [];
  fabrics: Fabric[] = [];
  categories: any[] = [];
  tallas: any[] = [];

  showModal: boolean = false;
  showConfirmationModal: boolean = false;

  currentModalType: 'model' | 'design' | 'fabric' | 'category' | 'talla' = 'model';
  isEditMode: boolean = false;
  currentEditId: string = '';
  currentItemData: Model | Design | Fabric | Talla | any | null = null;

  itemToDelete: {
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla';
    id: string;
    name?: string;
  } | null = null;

  isLoading: boolean = false;
  errorMessage: string | null = null;
  isSubmitting: boolean = false;

  private destroy$ = new Subject<void>();

  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadInitialData() {
    this.isLoading = true;
    this.errorMessage = null;
    forkJoin({
      modelos: this.userService.obtener_modelo(),
      disenos: this.userService.obtener_diseno(),
      telas: this.userService.obtener_tela_separados(),
      category: this.userService.obtener_categorias(),
      tallas: this.userService.obtener_tallas(),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: ({ modelos, disenos, telas, category, tallas }) => {
          this.models = [...(modelos || [])] as Model[];
          this.designs = [...(disenos || [])] as Design[];
          this.fabrics = [...(telas || [])] as Fabric[];
          this.categories = [...(category || [])] as Category[];
          this.tallas = [...(tallas || [])] as Talla[];
          console.log('Datos iniciales cargados/recargados.');
        },
        error: (err) => {
          console.error('Error al cargar datos iniciales:', err);
          this.errorMessage =
            'Error al cargar los datos. Por favor, intente de nuevo más tarde.';
        },
      });
  }

  getMongoId(item: any): string {
    return item?._id || item?.id || '';
  }

  openModal(type: 'model' | 'design' | 'fabric' | 'category' | 'talla') {
    this.currentModalType = type;
    this.isEditMode = false;
    this.currentItemData = null;
    this.currentEditId = '';
    this.errorMessage = null;
    this.showModal = true;
  }

  closeModal() {
    console.log('🔐 Cerrando modal...');

    this.showModal = false;
    this.isEditMode = false;
    this.currentItemData = null;
    this.currentEditId = '';
    this.isSubmitting = false;
    this.isLoading = false;
    this.errorMessage = null;

    this.cdr.detectChanges();

    console.log('✅ Modal cerrado correctamente');
  }

  editItem(
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla',
    item: Model | Design | Fabric | Talla | any
  ) {
    this.isEditMode = true;
    this.currentModalType = type;
    this.currentEditId = this.getMongoId(item);
    this.currentItemData = { ...JSON.parse(JSON.stringify(item)) };
    this.errorMessage = null;

    if (!this.currentEditId) {
      console.error(`No se pudo obtener el ID para editar el ${type}`, item);
      this.errorMessage = `No se pudo obtener el ID para editar. Intente de nuevo.`;
      this.cdr.detectChanges();
      return;
    }
    console.log(`Editando ${type} con ID: ${this.currentEditId}`);
    this.showModal = true;
  }

  confirmDeleteItem(
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla',
    item: Model | Design | Fabric | Talla | any
  ) {
    const id = this.getMongoId(item);
    this.errorMessage = null;

    if (!id) {
      console.error(
        `No se pudo obtener el ID del ${type} para eliminar.`,
        item
      );
      this.errorMessage = `No se pudo obtener el ID para eliminar. Intente de nuevo.`;
      this.cdr.detectChanges();
      return;
    }

    let itemName = 'este elemento';
    if (type === 'model') {
      itemName = (item as Model).nombre || 'este modelo';
    } else if (type === 'design') {
      itemName =
        (item as Design).design || (item as Design).nombre || 'este diseño';
    } else if (type === 'fabric') {
      itemName =
        `${(item as Fabric).diseno} - ${(item as Fabric).color}` || 'esta tela';
    } else if (type === 'category') {
      itemName = (item as any).nombre || 'esta categoria';
    } else if (type === 'talla') {
      itemName = (item as Talla).talla || 'esta talla';
    }

    this.itemToDelete = { type, id, name: itemName };
    this.showConfirmationModal = true;
  }

  handleConfirmation(confirmed: boolean) {
    console.log('handleConfirmation llamado con:', confirmed);
    console.log('itemToDelete:', this.itemToDelete);

    this.showConfirmationModal = false;

    if (confirmed && this.itemToDelete) {
      console.log('Procediendo a eliminar:', this.itemToDelete);
      this.deleteItem(this.itemToDelete.type, this.itemToDelete.id);
    } else {
      console.log('Eliminación cancelada o sin item para eliminar');
    }

    this.itemToDelete = null;
  }

  deleteItem(type: 'model' | 'design' | 'fabric' | 'category' | 'talla', id: string) {
    if (!id) {
      console.error(`ID no válido para eliminar ${type}`);
      this.errorMessage = `ID no válido para eliminar.`;
      this.cdr.detectChanges();
      return;
    }

    this.isSubmitting = true;
    this.errorMessage = null;
    let deleteObservable;

    switch (type) {
      case 'model':
        deleteObservable = this.userService.eliminar_modelo(id);
        break;
      case 'design':
        deleteObservable = this.userService.eliminar_diseno(id);
        break;
      case 'fabric':
        deleteObservable = this.userService.eliminar_tela(id);
        break;
      case 'category':
        // Verifica si existe el método en tu servicio, si no, créalo
        if (this.userService.eliminar_categoria) {
          deleteObservable = this.userService.eliminar_categoria(id);
        } else {
          console.error(
            'Método eliminar_categoria no implementado en el servicio'
          );
          this.errorMessage =
            'Funcionalidad de eliminar categoría no disponible.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
          return;
        }
        break;
      case 'talla':
        if (this.userService.eliminar_talla) {
          deleteObservable = this.userService.eliminar_talla(id);
        } else {
          console.error(
            'Método eliminar_talla no implementado en el servicio'
          );
          this.errorMessage =
            'Funcionalidad de eliminar talla no disponible.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
          return;
        }
        break;
      default:
        this.isSubmitting = false;
        console.error('Tipo de item desconocido para eliminar:', type);
        this.errorMessage = 'Tipo de item desconocido.';
        this.cdr.detectChanges();
        return;
    }

    deleteObservable
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response) => {
          console.log(`${type} con ID ${id} eliminado correctamente`, response);

          // Actualizar las listas locales
          switch (type) {
            case 'model':
              this.models = this.models.filter(
                (model) => this.getMongoId(model) !== id
              );
              break;
            case 'design':
              this.designs = this.designs.filter(
                (design) => this.getMongoId(design) !== id
              );
              break;
            case 'fabric':
              this.fabrics = this.fabrics.filter(
                (fabric) => this.getMongoId(fabric) !== id
              );
              break;
            case 'category':
              this.categories = this.categories.filter(
                (category) => this.getMongoId(category) !== id
              );
              break;
            case 'talla':
              this.tallas = this.tallas.filter(
                (talla) => this.getMongoId(talla) !== id
              );
              break;
          }

          // Mostrar mensaje de éxito (opcional)
          console.log(`${type} eliminado exitosamente`);
          this.cdr.detectChanges(); // Ensure UI updates after deletion
        },
        error: (error: any) => {
          console.error(`Error al eliminar el ${type} con ID ${id}:`, error);
          this.errorMessage = `Error al eliminar ${
            this.itemToDelete?.name || type
          }. Por favor, intente de nuevo.`;

          // Si el error es por item no encontrado, aún así remover de la lista local
          if (error.status === 404) {
            console.log(
              'Item no encontrado en servidor, removiendo de lista local'
            );
            switch (type) {
              case 'model':
                this.models = this.models.filter(
                  (model) => this.getMongoId(model) !== id
                );
                break;
              case 'design':
                this.designs = this.designs.filter(
                  (design) => this.getMongoId(design) !== id
                );
                break;
              case 'fabric':
                this.fabrics = this.fabrics.filter(
                  (fabric) => this.getMongoId(fabric) !== id
                );
                break;
              case 'category':
                this.categories = this.categories.filter(
                  (category) => this.getMongoId(category) !== id
                );
                break;
              case 'talla':
                this.tallas = this.tallas.filter(
                  (talla) => this.getMongoId(talla) !== id
                );
                break;
            }
            this.errorMessage = null; // Limpiar error si se removió localmente
          }
          this.cdr.detectChanges(); // Ensure UI updates on error, especially for error message
        },
      });
  }

  // --- MÉTODO PRINCIPAL CORREGIDO: Guardar/Actualizar Contenido desde Modal ---
  handleSavedContent(event: {
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla';
    data: any;
    isEdit?: boolean;
    editId?: string;
  }) {
    console.log('🔄 handleSavedContent recibido:', event);

    // Determinar si es edición basado en múltiples fuentes
    const isEdit = event.isEdit || this.isEditMode;
    const editId = event.editId || this.currentEditId;

    if (isEdit && editId) {
      console.log('📝 Procesando EDICIÓN');
      this.handleEditUpdate(event.type, editId, event.data);
    } else {
      console.log('➕ Procesando CREACIÓN');
      this.loadInitialData();
    }

    // Cerrar modal después de procesar
    setTimeout(() => {
      this.closeModal();
    }, 100);
  }

  // Método separado para manejar actualizaciones
  private handleEditUpdate(
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla',
    editId: string,
    updatedData: any
  ) {
    console.log('🔄 Actualizando item:', { type, editId, updatedData });

    this.isSubmitting = true;
    this.errorMessage = null;

    let updateObservable;

    // Preparar los datos para la actualización
    const updatePayload = { ...updatedData };

    switch (type) {
      case 'model':
        updateObservable = this.userService.actualizar_modelo(
          editId,
          updatePayload
        );
        break;
      case 'design':
        updateObservable = this.userService.actualizar_diseno(
          editId,
          updatePayload
        );
        break;
      case 'fabric':
        updateObservable = this.userService.actualizar_tela(
          editId,
          updatePayload
        );
        break;
      case 'category':
        if (this.userService.actualizar_categoria) {
          updateObservable = this.userService.actualizar_categoria(
            editId,
            updatePayload
          );
        } else {
          console.error('Método actualizar_categoria no disponible');
          this.handleError(
            'Funcionalidad de actualizar categoría no disponible.'
          );
          return;
        }
        break;
      case 'talla':
        if (this.userService.actualizar_talla) {
          updateObservable = this.userService.actualizar_talla(
            editId,
            updatePayload
          );
        } else {
          console.error('Método actualizar_talla no disponible');
          this.handleError(
            'Funcionalidad de actualizar talla no disponible.'
          );
          return;
        }
        break;
      default:
        this.handleError('Tipo de item desconocido para actualizar.');
        return;
    }

    updateObservable
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        })
      )
      .subscribe({
        next: (response: any) => {
          console.log('✅ Actualización exitosa:', response);

          // Usar la respuesta del servidor o los datos originales si no hay respuesta
          const itemToUpdate = response || {
            ...updatePayload,
            _id: editId,
            id: editId,
          };

          this.updateItemInArray(type, editId, itemToUpdate);
          this.forceChangeDetection();
          this.loadInitialData();

          console.log('🎉 Item actualizado en la lista');
        },
        error: (error: any) => {
          console.error('❌ Error al actualizar:', error);
          this.handleError(
            `Error al actualizar ${type}. Por favor, intente de nuevo.`
          );
        },
      });
  }

  // Método separado para manejar creación de nuevos items
  private handleNewItemCreation(
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla',
    newData: any
  ) {
    console.log('➕ handleNewItemCreation() llamado para:', type);
    console.log('➕ Creando nuevo item:', { type, newData });

    this.isSubmitting = true;
    this.errorMessage = null;

  }

  // Método mejorado para actualizar item en array
  private updateItemInArray(
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla',
    editId: string,
    updatedItem: any
  ) {
    console.log('🔄 Actualizando item en array:', {
      type,
      editId,
      updatedItem,
    });

    switch (type) {
      case 'model':
        const modelIndex = this.models.findIndex(
          (m) => this.getMongoId(m) === editId
        );
        if (modelIndex !== -1) {
          this.models = [
            ...this.models.slice(0, modelIndex),
            { ...updatedItem },
            ...this.models.slice(modelIndex + 1),
          ];
          console.log('✅ Modelo actualizado en posición:', modelIndex);
        }
        break;

      case 'design':
        const designIndex = this.designs.findIndex(
          (d) => this.getMongoId(d) === editId
        );
        if (designIndex !== -1) {
          this.designs = [
            ...this.designs.slice(0, designIndex),
            { ...updatedItem },
            ...this.designs.slice(designIndex + 1),
          ];
          console.log('✅ Diseño actualizado en posición:', designIndex);
        }
        break;

      case 'fabric':
        const fabricIndex = this.fabrics.findIndex(
          (f) => this.getMongoId(f) === editId
        );
        if (fabricIndex !== -1) {
          this.fabrics = [
            ...this.fabrics.slice(0, fabricIndex),
            { ...updatedItem },
            ...this.fabrics.slice(fabricIndex + 1),
          ];
          console.log('✅ Tela actualizada en posición:', fabricIndex);
        }
        break;

      case 'category':
        const categoryIndex = this.categories.findIndex(
          (c) => this.getMongoId(c) === editId
        );
        if (categoryIndex !== -1) {
          this.categories = [
            ...this.categories.slice(0, categoryIndex),
            { ...updatedItem },
            ...this.categories.slice(categoryIndex + 1),
          ];
          console.log('✅ Categoría actualizada en posición:', categoryIndex);
        }
        break;
      case 'talla':
        const tallaIndex = this.tallas.findIndex(
          (t) => this.getMongoId(t) === editId
        );
        if (tallaIndex !== -1) {
          this.tallas = [
            ...this.tallas.slice(0, tallaIndex),
            { ...updatedItem },
            ...this.tallas.slice(tallaIndex + 1),
          ];
          console.log('✅ Talla actualizada en posición:', tallaIndex);
        }
        break;
    }
  }

  // Método mejorado para agregar nuevo item
  private addItemToArray(
    type: 'model' | 'design' | 'fabric' | 'category' | 'talla',
    newItem: any
  ) {
    console.log('➕ Agregando nuevo item al array:', { type, newItem });

    switch (type) {
      case 'model':
        this.models = [{ ...newItem }, ...this.models];
        console.log('✅ Nuevo modelo agregado. Total:', this.models.length);
        break;
      case 'design':
        this.designs = [{ ...newItem }, ...this.designs];
        console.log('✅ Nuevo diseño agregado. Total:', this.designs.length);
        break;
      case 'fabric':
        this.fabrics = [{ ...newItem }, ...this.fabrics];
        console.log('✅ Nueva tela agregada. Total:', this.fabrics.length);
        break;
      case 'category':
        this.categories = [{ ...newItem }, ...this.categories];
        console.log(
          '✅ Nueva categoría agregada. Total:',
          this.categories.length
        );
        break;
      case 'talla':
        this.tallas = [{ ...newItem }, ...this.tallas];
        console.log(
          '✅ Nueva talla agregada. Total:',
          this.tallas.length
        );
        break;
    }
  }

  // Método mejorado para forzar detección de cambios
  private forceChangeDetection() {
    console.log('🔄 Forzando detección de cambios...');

    // Múltiples estrategias para asegurar que Angular detecte los cambios
    this.cdr.detectChanges();
    this.cdr.markForCheck();

    setTimeout(() => {
      this.cdr.detectChanges();
    }, 0);

    console.log('📊 Estado actual de arrays:', {
      modelsLength: this.models.length,
      designsLength: this.designs.length,
      fabricsLength: this.fabrics.length,
      categoriesLength: this.categories.length,
    });
  }

  // Método mejorado para manejo de errores
  private handleError(message: string) {
    this.errorMessage = message;
    this.isSubmitting = false;
    this.cdr.detectChanges();
    console.error('❌ Error manejado:', message);
  }

  // Uso alternativo: refrescar todos los datos después de editar
  refreshAllDataAfterEdit() {
    // Solo recargar los datos del tab activo para mejor performance
    switch (this.activeTab) {
      case 'models':
        this.userService
          .obtener_modelo()
          .pipe(takeUntil(this.destroy$))
          .subscribe((models) => {
            this.models = [...(models || [])];
            this.cdr.detectChanges();
          });
        break;
      case 'designs':
        this.userService
          .obtener_diseno()
          .pipe(takeUntil(this.destroy$))
          .subscribe((designs) => {
            this.designs = [...(designs || [])];
            this.cdr.detectChanges();
          });
        break;
      // Similar para otros tabs...
    }
  }

  // Método para guardar todo el formulario (si se implementara una funcionalidad de "Guardar Todo")
  onSubmit() {
    // Esta función actualmente no está conectada a ningún elemento de la UI en el HTML proporcionado.
    // Si fuera necesario, aquí se implementaría la lógica para guardar todos los cambios pendientes.
    this.isLoading = true; // O un nuevo estado como isSavingAll
    this.errorMessage = null;
    console.log('Intentando guardar todos los datos...');
    // Lógica para enviar todos los datos (models, designs, fabrics) al backend.
    // Ejemplo:
    // this.userService.guardarTodo({ models: this.models, designs: this.designs, fabrics: this.fabrics })
    //   .pipe(
    //     takeUntil(this.destroy$),
    //     finalize(() => {
    //       this.isLoading = false;
    //       this.cdr.detectChanges();
    //     })
    //   )
    //   .subscribe({
    //     next: () => console.log('Todos los datos guardados exitosamente.'),
    //     error: (err) => {
    //       this.errorMessage = 'Error al guardar todos los datos.';
    //       console.error(err);
    //     }
    //   });
  }
}
