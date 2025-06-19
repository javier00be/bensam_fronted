import { Component } from '@angular/core';
import { AnnouncementBarComponent } from '../components/announcement-bar/announcement-bar.component';
import { HeaderComponent } from '../shared/header/header.component';
import { FooterComponent } from '../shared/footer/footer.component';

@Component({
  selector: 'app-tienda',
  imports: [
    AnnouncementBarComponent,
    HeaderComponent,
    FooterComponent
  ],
  templateUrl: './tienda.component.html',
  styleUrl: './tienda.component.css',
})
export class TiendaComponent {}
