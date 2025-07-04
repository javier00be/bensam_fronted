import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  // Asegúrate de que esta URL tenga http:// o https:// al inicio
  private apiUrl = 'http://localhost:3000/api';

  constructor(private http: HttpClient) {}

  // Guardar modelo
  insertar_modelo(modelData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/modelo/crear`, modelData);
  }

  // Guardar diseño
  insertar_diseno(designData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/diseno/crear`, designData);
  }

  // Guardar tela
  insertar_tela(fabricData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/tela/crear`, fabricData);
  }

  // Obtener modelos
  obtener_modelo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/modelo/obtener`);
  }

  // Obtener diseños
  obtener_diseno(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/diseno/obtener`);
  }

  // Obtener telas
  obtener_telas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tela/obtener`);
  }

  obtener_tela_separados(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/tela/obtener_separado`);
  }

  // Actualizar modelo
  actualizar_modelo(id: string, modelData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/modelo/actualizar/${id}`, modelData);
  }

  // Actualizar diseño
  actualizar_diseno(id: string, designData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/diseno/actualizar/${id}`, designData);
  }

  // Actualizar tela
  actualizar_tela(id: string, fabricData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/tela/actualizar/${id}`, fabricData);
  }

  // Eliminar modelo
  eliminar_modelo(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/modelo/eliminar/${id}`);
  }

  // Eliminar diseño
  eliminar_diseno(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/diseno/eliminar/${id}`);
  }

  // Eliminar tela
  eliminar_tela(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/tela/eliminar/${id}`);
  }

  obtener_modelos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/modelo/obtener`);
  }

  // Obtener modelo por ID
  obtener_modelo_por_id(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/modelo/obtener/${id}`);
  }

  // Obtener diseño por ID
  obtener_diseno_por_id(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/diseno/obtener/${id}`);
  }

  // Obtener tela por ID
  obtener_tela_por_id(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/tela/obtener/${id}`);
  }

  insertar_talla(tallaData: any): Observable<any> {
    console.log('insertar_talla() llamado con:', tallaData);
    return this.http.post(`${this.apiUrl}/talla/crear`, tallaData)
      .pipe(
        catchError((error: HttpErrorResponse) => {
          console.error('Error inserting talla:', error);
          return throwError(error);
        })
      );
  }

  obtener_tallas(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/talla/obtener`);
  }

  actualizar_talla(id: string, tallaData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/talla/actualizar/${id}`, tallaData);
  }

  eliminar_talla(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/talla/eliminar/${id}`);
  }

  //Metdo para el almacaen
  insertar_almacen(almacenData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/almacen/crear`, almacenData);
  }

  obtener_almacen(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/almacen/obtener`);
  }

  //metodos para categorias
  insertar_categoria(categoriaData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/categoria/crear`, categoriaData);
  }
  obtener_categorias(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/categoria/obtener`);
  }
  actualizar_categoria(id: string, categoriaData: any): Observable<any> {
    return this.http.put(
      `${this.apiUrl}/categoria/actualizar/${id}`,
      categoriaData
    );
  }
  eliminar_categoria(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/categoria/eliminar/${id}`);
  }

  //metodos para productos
  insertar_producto(productData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/producto/crear`, productData);
  }

  obtener_productos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/producto/obtener`);
  }

  obtener_producto_por_id(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/producto/obtener/${id}`);
  }


   // ✅ Nuevo método para subir UNA imagen a través de tu backend a Cloudinary
  uploadImage(file: File): Observable<{ url: string }> { // Esperamos una URL
    const formData = new FormData();
    formData.append('image', file, file.name); // 'image' debe coincidir con el nombre del campo en Multer (upload.single('image'))
    return this.http.post<{ url: string }>(`${this.apiUrl}/upload-image`, formData);
  }


}
