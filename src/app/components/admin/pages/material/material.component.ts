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

@Component({
  selector: 'app-material',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ModalComponent,
    HttpClientModule, // Para componentes standalone, considera usar provideHttpClient() en la configuración de la app o en los providers del componente
    ConfirmationModalComponent,
  ],
  providers: [UserService],
  templateUrl: './material.component.html',
  styleUrls: ['./material.component.css'],
})
export class MaterialComponent implements OnInit, OnDestroy {
  // --- Variables de Estado ---
  activeTab: 'models' | 'designs' | 'fabrics' | 'categories' = 'models'; // Inicializa activeTab

  // Arrays de datos con tipos
  models: Model[] = [];
  designs: Design[] = [];
  fabrics: Fabric[] = [];
  categories: any[] = [];

  // Visibilidad de modales
  showModal: boolean = false;
  showConfirmationModal: boolean = false;

  // Para modal de añadir/editar
  currentModalType: 'model' | 'design' | 'fabric' | 'category' = 'model';
  isEditMode: boolean = false;
  currentEditId: string = '';
  currentItemData: Model | Design | Fabric | any | null = null;

  // Para modal de confirmación
  itemToDelete: {
    type: 'model' | 'design' | 'fabric' | 'category';
    id: string;
    name?: string;
  } | null = null;

  // Estados de carga y error
  isLoading: boolean = false;
  errorMessage: string | null = null;
  isSubmitting: boolean = false; // Para operaciones de guardado/eliminación en modales

  private destroy$ = new Subject<void>(); // Para desuscribirse de observables

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
      telas: this.userService.obtener_telas(),
    })
      .pipe(
        takeUntil(this.destroy$), // Desuscribirse cuando el componente se destruya
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges(); // Asegura la actualización de la UI cuando la carga finaliza
        })
      )
      .subscribe({
        next: ({ modelos, disenos, telas }) => {
          this.models = [...(modelos || [])] as Model[];
          this.designs = [...(disenos || [])] as Design[];
          this.fabrics = [...(telas || [])] as Fabric[];
          console.log('Datos iniciales cargados/recargados.');
        },
        error: (err) => {
          console.error('Error al cargar datos iniciales:', err);
          this.errorMessage =
            'Error al cargar los datos. Por favor, intente de nuevo más tarde.';
        },
      });
  }

  // Método para obtener el ID correcto (MongoDB podría usar _id)
  getMongoId(item: any): string {
    return item?._id || item?.id || '';
  }

  // --- Manejo de Modales ---
  openModal(type: 'model' | 'design' | 'fabric' | 'category') {
    this.currentModalType = type;
    this.isEditMode = false;
    this.currentItemData = null;
    this.currentEditId = '';
    this.errorMessage = null; // Limpiar errores previos al abrir modal
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.currentItemData = null;
    this.currentEditId = '';
  }

  // --- Editar Elemento ---
  editItem(
    type: 'model' | 'design' | 'fabric' | 'category',
    item: Model | Design | Fabric | any
  ) {
    this.isEditMode = true;
    this.currentModalType = type;
    this.currentEditId = this.getMongoId(item);
    this.currentItemData = { ...item }; // Clonar para evitar mutación directa
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

  // --- Eliminar Elemento ---
  confirmDeleteItem(
    type: 'model' | 'design' | 'fabric' | 'category',
    item: Model | Design | Fabric | any
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
    }

    this.itemToDelete = { type, id, name: itemName };
    this.showConfirmationModal = true;
  }

  handleConfirmation(confirmed: boolean) {
    this.showConfirmationModal = false;
    if (confirmed && this.itemToDelete) {
      this.deleteItem(this.itemToDelete.type, this.itemToDelete.id);
    }
    this.itemToDelete = null;
  }

  deleteItem(type: 'model' | 'design' | 'fabric' | 'category', id: string) {
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
        // Assuming you have a delete category service
        // deleteObservable = this.userService.eliminar_categoria(id);
        deleteObservable = new Subject().asObservable(); // Placeholder
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
        next: () => {
          console.log(`${type} con ID ${id} eliminado correctamente`);
          if (type === 'model') {
            this.models = this.models.filter(
              (model) => this.getMongoId(model) !== id
            );
          } else if (type === 'design') {
            this.designs = this.designs.filter(
              (design) => this.getMongoId(design) !== id
            );
          } else if (type === 'fabric') {
            this.fabrics = this.fabrics.filter(
              (fabric) => this.getMongoId(fabric) !== id
            );
          } else if (type === 'category') {
            this.categories = this.categories.filter(
              (category) => this.getMongoId(category) !== id
            );
          }
        },
        error: (error: any) => {
          console.error(`Error al eliminar el ${type} con ID ${id}:`, error);
          this.errorMessage = `Error al eliminar ${
            this.itemToDelete?.name || type
          }. Por favor, intente de nuevo.`;
        },
      });
  }

  // --- Guardar/Actualizar Contenido desde Modal ---
  handleSavedContent(event: {
    type: 'model' | 'design' | 'fabric' | 'category';
    data: any; // Debería ser Model, Design, o Fabric (sin id para nuevo, con para editar)
  }) {
    this.isSubmitting = true;
    this.errorMessage = null;
    let saveObservable;

    if (this.isEditMode && this.currentEditId) {
      // --- Actualizar elemento existente ---
      const updateData = event.data;
      console.log(
        `Actualizando ${event.type} con ID ${this.currentEditId}:`,
        updateData
      );
      switch (event.type) {
        case 'model':
          saveObservable = this.userService.actualizar_modelo(
            this.currentEditId,
            updateData
          );
          break;
        case 'design':
          saveObservable = this.userService.actualizar_diseno(
            this.currentEditId,
            updateData
          );
          break;
        case 'fabric':
          saveObservable = this.userService.actualizar_tela(
            this.currentEditId,
            updateData
          );
          break;
        case 'category':
          // Assuming you have an update category service
          // saveObservable = this.userService.actualizar_categoria(this.currentEditId, updateData);
          saveObservable = new Subject().asObservable(); // Placeholder
          break;
        default:
          this.isSubmitting = false;
          this.errorMessage = 'Tipo de item desconocido para actualizar.';
          this.cdr.detectChanges();
          return;
      }

      saveObservable
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (response: any) => {
            // response es el item actualizado desde el backend
            console.log(
              `Respuesta del servidor al actualizar ${event.type}:`,
              response
            );
            // Asumimos que 'response' es el objeto actualizado completo.
            // Si 'response' es solo un mensaje de éxito, necesitarías fusionar 'updateData' con el item existente.
            const updatedItemFromApi = response;

            if (event.type === 'model') {
              const index = this.models.findIndex(
                (m) => this.getMongoId(m) === this.currentEditId
              );
              if (index !== -1) {
                this.models = [
                  ...this.models.slice(0, index),
                  updatedItemFromApi as Model,
                  ...this.models.slice(index + 1),
                ];
              }
            } else if (event.type === 'design') {
              const index = this.designs.findIndex(
                (d) => this.getMongoId(d) === this.currentEditId
              );
              if (index !== -1) {
                this.designs = [
                  ...this.designs.slice(0, index),
                  updatedItemFromApi as Design,
                  ...this.designs.slice(index + 1),
                ];
              }
            } else if (event.type === 'fabric') {
              const index = this.fabrics.findIndex(
                (f) => this.getMongoId(f) === this.currentEditId
              );
              if (index !== -1) {
                this.fabrics = [
                  ...this.fabrics.slice(0, index),
                  updatedItemFromApi as Fabric,
                  ...this.fabrics.slice(index + 1),
                ];
              }
            } else if (event.type === 'category') {
              const index = this.categories.findIndex(
                (c) => this.getMongoId(c) === this.currentEditId
              );
              if (index !== -1) {
                this.categories = [
                  ...this.categories.slice(0, index),
                  updatedItemFromApi,
                  ...this.categories.slice(index + 1),
                ];
              }
            }
            this.closeModal();
          },
          error: (error: any) => {
            console.error(`Error al actualizar ${event.type}:`, error);
            this.errorMessage = `Error al actualizar. Por favor, revise los datos e intente de nuevo.`;
            // El modal permanece abierto para corrección
          },
        });
    } else {
      // --- Crear nuevo elemento ---
      const createData = event.data;
      console.log(`Creando nuevo ${event.type}:`, createData);
      switch (event.type) {
        case 'model':
          saveObservable = this.userService.insertar_modelo(createData);
          break;
        case 'design':
          saveObservable = this.userService.insertar_diseno(createData);
          break;
        case 'fabric':
          saveObservable = this.userService.insertar_tela(createData);
          break;
        case 'category':
          // Assuming you have a create category service
          // saveObservable = this.userService.insertar_categoria(createData);
          saveObservable = new Subject().asObservable(); // Placeholder
          break;
        default:
          this.isSubmitting = false;
          this.errorMessage = 'Tipo de item desconocido para crear.';
          this.cdr.detectChanges();
          return;
      }

      saveObservable
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            this.isSubmitting = false;
            this.cdr.detectChanges();
          })
        )
        .subscribe({
          next: (response: any) => {
            // response es el nuevo item creado desde el backend (con _id, createdAt, etc.)
            console.log(
              `Respuesta del servidor al crear ${event.type}:`,
              response
            );
            const newItemFromApi = response; // Asumimos que 'response' es el objeto nuevo completo
            if (event.type === 'model') {
              this.models = [newItemFromApi as Model, ...this.models];
            } else if (event.type === 'design') {
              this.designs = [newItemFromApi as Design, ...this.designs];
            } else if (event.type === 'fabric') {
              this.fabrics = [newItemFromApi as Fabric, ...this.fabrics];
            } else if (event.type === 'category') {
              this.categories = [newItemFromApi, ...this.categories];
            }
            this.closeModal();
          },
          error: (error: any) => {
            console.error(`Error al crear ${event.type}:`, error);
            this.errorMessage = `Error al crear. Por favor, revise los datos e intente de nuevo.`;
            // El modal permanece abierto para corrección
          },
        });
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
