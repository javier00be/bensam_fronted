import { HttpClientModule } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from '../modal/modal.component';
import { UserService } from '../../../../services/user.service';
import { ConfirmationModalComponent } from '../confirmation-modal/confirmation-modal.component';
import { forkJoin } from 'rxjs';

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
export class MaterialComponent implements OnInit {
  constructor(
    private userService: UserService,
    private cdr: ChangeDetectorRef // Inyectamos ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.loadInitialData();
  }

loadInitialData() {
  forkJoin({
    modelos: this.userService.obtener_modelo(),
    disenos: this.userService.obtener_diseno(),
    telas: this.userService.obtener_telas()
  }).subscribe(({ modelos, disenos, telas }) => {
    this.models = [...modelos];
    this.designs = [...disenos];
    this.fabrics = [...telas];

    console.log('Datos recargados:');
    console.log('Modelos:', this.models);
    console.log('Diseños:', this.designs);
    console.log('Telas:', this.fabrics);

    this.cdr.detectChanges(); // Solo una vez, después de actualizar todo
  });
}

  // Variable para controlar la visibilidad del modal
  showModal: boolean = false;

  // Variable para controlar la visibilidad del modal de confirmación
  showConfirmationModal: boolean = false;

  // Variable para almacenar el elemento a eliminar
  itemToDelete: {
    type: 'model' | 'design' | 'fabric';
    id: string;
    name?: string;
  } | null = null;

  // Variable para controlar el tipo de modal actual
  currentModalType: 'model' | 'design' | 'fabric' = 'model';

  // Variables para almacenar los contenidos guardados
  models: any[] = [];
  designs: any[] = [];
  fabrics: any[] = [];

  // Variable para controlar si estamos en modo edición
  isEditMode: boolean = false;

  // Variable para guardar el ID del elemento a editar
  currentEditId: string = '';

  // Variable para guardar los datos del elemento a editar
  currentItemData: any = null;

  // Método para abrir el modal según el tipo
  openModal(type: 'model' | 'design' | 'fabric') {
    this.currentModalType = type;
    this.showModal = true;
    this.isEditMode = false;
    this.currentItemData = null;
    this.currentEditId = '';
  }

  // Método para cerrar el modal
  closeModal() {
    this.showModal = false;
    this.isEditMode = false;
    this.currentItemData = null;
    this.currentEditId = '';
  }

  // Método para conseguir el ID correcto de MongoDB (puede ser _id o id)
  getMongoId(item: any): string {
    // MongoDB podría devolver el ID como _id o id dependiendo de cómo esté configurado el backend
    return item._id || item.id;
  }

  // Método para editar un elemento
  editItem(type: 'model' | 'design' | 'fabric', item: any) {
    this.isEditMode = true;
    this.currentModalType = type;

    // Asegúrate de obtener el ID correcto (puede ser _id en MongoDB)
    this.currentEditId = this.getMongoId(item);

    // Clonamos el objeto para evitar referencias directas
    this.currentItemData = { ...item };

    // Verificamos que tengamos el id correcto
    console.log(`Editando ${type} con ID: ${this.currentEditId}`);

    // Abre el modal con los datos cargados
    this.showModal = true;
  }

  // Método para iniciar la confirmación de eliminación de un elemento
  confirmDeleteItem(type: 'model' | 'design' | 'fabric', item: any) {
    // Obtener el ID correcto del elemento
    const id = this.getMongoId(item);

    if (!id) {
      console.error(`No se pudo obtener el ID del ${type}`, item);
      return;
    }

    let itemName = '';

    // Obtener el nombre del elemento para mostrar en el modal
    if (type === 'model') {
      itemName = item ? item.nombre : 'este modelo';
    } else if (type === 'design') {
      itemName = item ? item.design || item.nombre : 'este diseño';
    } else if (type === 'fabric') {
      itemName = item ? `${item.diseno} - ${item.color}` : 'esta tela';
    }

    console.log(
      `Confirmando eliminación de ${type} con ID: ${id}, Nombre: ${itemName}`
    );

    this.itemToDelete = { type, id, name: itemName };
    this.showConfirmationModal = true;
  }

  // Método para manejar la respuesta del modal de confirmación
  handleConfirmation(confirmed: boolean) {
    this.showConfirmationModal = false;

    if (confirmed && this.itemToDelete) {
      console.log(
        `Eliminando ${this.itemToDelete.type} con ID: ${this.itemToDelete.id}`
      );
      this.deleteItem(this.itemToDelete.type, this.itemToDelete.id);
    }

    this.itemToDelete = null;
  }

  // Método para eliminar un elemento
  deleteItem(type: 'model' | 'design' | 'fabric', id: string) {
    if (!id) {
      console.error(`ID no válido para eliminar ${type}`);
      return;
    }

    switch (type) {
      case 'model':
        this.userService.eliminar_modelo(id).subscribe(
          () => {
            this.models = this.models.filter(
              (model) => this.getMongoId(model) !== id
            );
            console.log('Modelo eliminado correctamente');
            this.cdr.detectChanges(); // Forzar detección de cambios
          },
          (error) => {
            console.error('Error al eliminar el modelo:', error);
          }
        );
        break;
      case 'design':
        this.userService.eliminar_diseno(id).subscribe(
          () => {
            this.designs = this.designs.filter(
              (design) => this.getMongoId(design) !== id
            );
            console.log('Diseño eliminado correctamente');
            this.cdr.detectChanges(); // Forzar detección de cambios
          },
          (error) => {
            console.error('Error al eliminar el diseño:', error);
          }
        );
        break;
      case 'fabric':
        this.userService.eliminar_tela(id).subscribe(
          () => {
            this.fabrics = this.fabrics.filter(
              (fabric) => this.getMongoId(fabric) !== id
            );
            console.log('Tela eliminada correctamente');
            this.cdr.detectChanges(); // Forzar detección de cambios
          },
          (error) => {
            console.error('Error al eliminar la tela:', error);
          }
        );
        break;
    }
  }

  // Método para manejar el contenido guardado desde el modal
  handleSavedContent(event: {
    type: string;
    data: any;
    response?: any;
    isEdit?: boolean;
    editId?: string;
  }) {
    console.log('Recibido evento de guardado:', event);

    // Si es una edición
    if (this.isEditMode && this.currentEditId) {
      const updatedData = event.data;

      switch (event.type) {
        case 'model':
          this.userService
            .actualizar_modelo(this.currentEditId, updatedData)
            .subscribe(
              (response) => {
                console.log(
                  'Respuesta del servidor al actualizar modelo:',
                  response
                );

                // Buscar el índice del modelo en el arreglo
                const index = this.models.findIndex(
                  (model) => this.getMongoId(model) === this.currentEditId
                );

                if (index !== -1) {
                  // Actualizar el modelo con la respuesta del servidor o con los datos actualizados
                  const updatedModel = response || {
                    ...this.models[index],
                    ...updatedData,
                  };
                  console.log(
                    'Actualizando modelo en índice',
                    index,
                    'con:',
                    updatedModel
                  );

                  // Crear un nuevo arreglo para forzar la detección de cambios
                  const newModels = [...this.models];
                  newModels[index] = updatedModel;
                  this.models = newModels;

                  console.log('Arreglo de modelos actualizado:', this.models);
                  this.cdr.markForCheck();
                  this.cdr.detectChanges();
                }
              },
              (error) => {
                console.error('Error al actualizar el modelo:', error);
              }
            );
          break;

        case 'design':
          this.userService
            .actualizar_diseno(this.currentEditId, updatedData)
            .subscribe(
              (response) => {
                console.log(
                  'Respuesta del servidor al actualizar diseño:',
                  response
                );

                // Buscar el índice del diseño en el arreglo
                const index = this.designs.findIndex(
                  (design) => this.getMongoId(design) === this.currentEditId
                );

                if (index !== -1) {
                  // Actualizar el diseño con la respuesta del servidor o con los datos actualizados
                  const updatedDesign = response || {
                    ...this.designs[index],
                    ...updatedData,
                  };
                  console.log(
                    'Actualizando diseño en índice',
                    index,
                    'con:',
                    updatedDesign
                  );

                  // Crear un nuevo arreglo para forzar la detección de cambios
                  const newDesigns = [...this.designs];
                  newDesigns[index] = updatedDesign;
                  this.designs = newDesigns;

                  console.log('Arreglo de diseños actualizado:', this.designs);
                  this.cdr.markForCheck();
                  this.cdr.detectChanges();
                }
              },
              (error) => {
                console.error('Error al actualizar el diseño:', error);
              }
            );
          break;

        case 'fabric':
          this.userService
            .actualizar_tela(this.currentEditId, updatedData)
            .subscribe(
              (response) => {
                console.log(
                  'Respuesta del servidor al actualizar tela:',
                  response
                );

                // Buscar el índice de la tela en el arreglo
                const index = this.fabrics.findIndex(
                  (fabric) => this.getMongoId(fabric) === this.currentEditId
                );

                if (index !== -1) {
                  // Actualizar la tela con la respuesta del servidor o con los datos actualizados
                  const updatedFabric = response || {
                    ...this.fabrics[index],
                    ...updatedData,
                  };
                  console.log(
                    'Actualizando tela en índice',
                    index,
                    'con:',
                    updatedFabric
                  );

                  // Crear un nuevo arreglo para forzar la detección de cambios
                  const newFabrics = [...this.fabrics];
                  newFabrics[index] = updatedFabric;
                  this.fabrics = newFabrics;

                  console.log('Arreglo de telas actualizado:', this.fabrics);
                  this.cdr.markForCheck();
                  this.cdr.detectChanges();
                }
              },
              (error) => {
                console.error('Error al actualizar la tela:', error);
              }
            );
          break;
      }
    }
    // Si es inserción
    else {
      const saved =
        event.response?.nuevoModelo ||
        event.response?.nuevoDiseno ||
        event.response?.nuevaTela ||
        event.data;

      console.log('Elemento guardado por el servidor:', saved);

      switch (event.type) {
        case 'model':
          this.models = [...this.models, saved];
          console.log(
            'Modelos actualizados después de inserción:',
            this.models
          );
          break;
        case 'design':
          this.designs = [...this.designs, saved];
          console.log(
            'Diseños actualizados después de inserción:',
            this.designs
          );
          break;
        case 'fabric':
          this.fabrics = [...this.fabrics, saved];
          console.log('Telas actualizadas después de inserción:', this.fabrics);
          break;
      }

      // ✅ Refrescar datos después de insertar o editar
      this.loadInitialData(); // <- AÑADE ESTA LÍNEA AQUÍ
      // Forzar la detección de cambios después de la inserción
      this.cdr.markForCheck();
      this.cdr.detectChanges();
    }

    // Resetear el modo de edición
    this.isEditMode = false;
    this.currentEditId = '';
    this.currentItemData = null;
  }

  // Método para guardar todo el formulario
  onSubmit() {
    const formData = {
      models: this.models,
      designs: this.designs,
      fabrics: this.fabrics,
    };

    console.log('Datos del formulario completo:', formData);

    // Aquí podrías enviar todos los datos si tienes una API:
    // this.userService.saveAll(formData).subscribe(...)
  }

  
}
