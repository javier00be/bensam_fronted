// src/app/app.config.ts

import { ApplicationConfig } from '@angular/core'; // Ya no necesitas importProvidersFrom aquí
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';

// Ya NO importes ImageCropperModule aquí
// import { ImageCropperModule } from 'ngx-image-cropper'; // <-- ¡Elimina esta línea!

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // Ya NO necesitas importProvidersFrom(ImageCropperModule) aquí
  ]
};
