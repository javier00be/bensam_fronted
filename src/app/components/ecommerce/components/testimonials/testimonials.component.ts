// src/app/testimonials/testimonials.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

// Interface for testimonial data structure
interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  comment: string;
}

@Component({
  selector: 'app-testimonials',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './testimonials.component.html'
})
export class TestimonialsComponent implements OnInit, OnDestroy {

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'María G.',
      avatar: 'https://storage.googleapis.com/a1aa/image/e9166e97-1b01-4a35-6c39-d7fff966fae7.jpg',
      comment: 'Calidad increíble y envío rápido. ¡Recomiendo totalmente Benzoom!'
    },
    {
      id: 2,
      name: 'Carlos M.',
      avatar: 'https://storage.googleapis.com/a1aa/image/4592a44d-833a-408e-6cfe-92b750ed819c.jpg',
      comment: 'Excelente atención al cliente y productos con mucho estilo. Volveré a comprar.'
    },
    {
      id: 3,
      name: 'Ana L.',
      avatar: 'https://storage.googleapis.com/a1aa/image/e9166e97-1b01-4a35-6c39-d7fff966fae7.jpg',
      comment: 'Me encanta la variedad y calidad. ¡La oferta fue un gran bonus!'
    },
    {
      id: 4,
      name: 'Ricardo P.',
      avatar: 'https://placehold.co/48x48/A7F3D0/333333?text=RP',
      comment: 'Productos fantásticos. Mi pedido llegó rápido y los artículos superaron mis expectativas.'
    },
    {
      id: 5,
      name: 'Sofía R.',
      avatar: 'https://placehold.co/48x48/C4B5FD/333333?text=SR',
      comment: 'Soporte al cliente excepcional. Hicieron todo lo posible para ayudarme con mis consultas.'
    },
    {
      id: 6,
      name: 'Diego F.',
      avatar: 'https://placehold.co/48x48/FDE68A/333333?text=DF',
      comment: 'Productos de alta calidad a precios excelentes. La experiencia de compra fue perfecta.'
    }
  ];

  currentIndex: number = 0;
  private autoSlideInterval: any;
  private readonly SLIDE_DURATION = 4000; // 4 segundos

  constructor() { }

  ngOnInit(): void {
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  /**
   * Inicia el auto-slide del carrusel
   */
  private startAutoSlide(): void {
    this.autoSlideInterval = setInterval(() => {
      this.nextSlide();
    }, this.SLIDE_DURATION);
  }

  /**
   * Detiene el auto-slide del carrusel
   */
  private stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  /**
   * Reinicia el auto-slide
   */
  private restartAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

  /**
   * Va al siguiente slide (mueve una posición)
   */
  nextSlide(): void {
    const maxIndex = Math.max(0, this.testimonials.length - 3);
    this.currentIndex = this.currentIndex >= maxIndex ? 0 : this.currentIndex + 1;
  }

  /**
   * Va al slide anterior
   */
  prevSlide(): void {
    const maxIndex = Math.max(0, this.testimonials.length - 3);
    this.currentIndex = this.currentIndex <= 0 ? maxIndex : this.currentIndex - 1;
    this.restartAutoSlide();
  }

  /**
   * Va a un slide específico
   */
  goToSlide(index: number): void {
    const maxIndex = Math.max(0, this.testimonials.length - 3);
    if (index >= 0 && index <= maxIndex) {
      this.currentIndex = index;
      this.restartAutoSlide();
    }
  }

  /**
   * Genera array para los indicadores
   */
  getSlideIndicators(): number[] {
    const totalSlides = Math.max(1, this.testimonials.length - 2);
    return Array.from({length: totalSlides}, (_, i) => i);
  }
}
