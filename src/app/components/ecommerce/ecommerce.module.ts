import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { EcommerceRoutingModule } from './ecommerce-routing.module';
import { AnnouncementBarComponent } from './components/announcement-bar/announcement-bar.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    EcommerceRoutingModule,
    AnnouncementBarComponent
  ]
})
export class EcommerceModule { }
