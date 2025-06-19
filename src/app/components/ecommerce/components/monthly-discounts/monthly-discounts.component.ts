// src/app/components/ecommerce/components/monthly-discounts/monthly-discounts.component.ts

import { Component, OnInit, OnDestroy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { interval, Subscription } from 'rxjs';
import { takeWhile } from 'rxjs/operators';

// Interfaz para definir la estructura de un producto
interface Product {
  src: string;
  alt: string;
  discount: number;
  title: string;
  price: string;
  category: string;
}

// Interfaz para las dimensiones responsivas del carrusel
interface CarouselDimensions {
  cardWidth: number;
  cardGap: number;
}

@Component({
  selector: 'app-monthly-discounts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './monthly-discounts.component.html',
  styleUrls: ['./monthly-discounts.component.css']
})
export default class MonthlyDiscountsComponent implements OnInit, OnDestroy {
  // Propiedades de la cuenta regresiva
  countdown: { days: number; hours: number; minutes: number; seconds: number } = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };
  private countdownEndDate: Date;
  private countdownSubscription!: Subscription;
  private autoSlideSubscription!: Subscription;

  // Propiedades del carrusel
  @ViewChild('carouselContainer', { static: true }) carouselContainer!: ElementRef;
  products: Product[] = [
    {
      src: 'https://storage.googleapis.com/a1aa/image/ed603a48-c8ec-4d41-26a3-406c4f040c64.jpg',
      alt: 'Traje azul marino elegante',
      discount: 30,
      title: 'Traje Azul Marino',
      price: '$299.99',
      category: 'Formal'
    },
    {
      src: 'https://images.unsplash.com/photo-1596752766624-958807d903f0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Traje gris claro moderno',
      discount: 40,
      title: 'Traje Gris Claro',
      price: '$259.99',
      category: 'Casual'
    },
    {
      src: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Traje negro ejecutivo',
      discount: 25,
      title: 'Traje Negro Premium',
      price: '$389.99',
      category: 'Ejecutivo'
    },
    {
      src: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Traje beige verano',
      discount: 35,
      title: 'Traje Beige Verano',
      price: '$219.99',
      category: 'Casual'
    },
    {
      src: 'https://images.unsplash.com/photo-1593035308630-f865f12e879a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Traje a rayas azul',
      discount: 20,
      title: 'Traje Rayas Azul',
      price: '$279.99',
      category: 'Formal'
    },
    {
      src: 'https://images.unsplash.com/photo-1549429158-a53c399580b0?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      alt: 'Traje de dos piezas negro',
      discount: 45,
      title: 'Conjunto Ejecutivo',
      price: '$329.99',
      category: 'Ejecutivo'
    }
  ];

  currentIndex = 0;
  isAutoSliding = true;

  // Dimensiones del carrusel responsivas
  private carouselDimensions: CarouselDimensions = {
    cardWidth: 280, // Móvil por defecto
    cardGap: 12
  };

  // Propiedades para la funcionalidad de arrastre
  isDragging = false;
  startX = 0;
  currentTranslateX = 0;
  startTranslateX = 0;

  // Propiedades para mejor UX
  dragThreshold = 50;
  isHovering = false;

  // Propiedades responsivas
  currentBreakpoint: 'mobile' | 'tablet' | 'desktop' = 'mobile';

  // Propiedades para window (para usar en el template)
  window = window;

  constructor() {
    this.countdownEndDate = new Date();
    this.countdownEndDate.setDate(this.countdownEndDate.getDate() + 2);
    this.countdownEndDate.setHours(this.countdownEndDate.getHours() + 6);
    this.countdownEndDate.setMinutes(this.countdownEndDate.getMinutes() + 5);
    this.countdownEndDate.setSeconds(this.countdownEndDate.getSeconds() + 30);
  }

  ngOnInit(): void {
    this.initializeCountdown();
    this.updateCarouselDimensions();
    this.startAutoSlide();
    this.updateCarouselPosition();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  /**
   * Escucha los cambios de tamaño de ventana para actualizar las dimensiones del carrusel
   */
  @HostListener('window:resize', ['$event'])
  onWindowResize(): void {
    this.updateCarouselDimensions();
    this.updateCarouselPosition();
  }

  /**
   * Actualiza las dimensiones del carrusel según el breakpoint actual
   */
  private updateCarouselDimensions(): void {
    const windowWidth = window.innerWidth;

    if (windowWidth < 640) { // Mobile
      this.currentBreakpoint = 'mobile';
      this.carouselDimensions = { cardWidth: 280, cardGap: 12 };
    } else if (windowWidth < 1024) { // Tablet
      this.currentBreakpoint = 'tablet';
      this.carouselDimensions = { cardWidth: 320, cardGap: 16 };
    } else { // Desktop
      this.currentBreakpoint = 'desktop';
      this.carouselDimensions = { cardWidth: 350, cardGap: 24 };
    }
  }

  /**
   * Getter para acceder al ancho de la tarjeta desde el template
   */
  get singleCardWidth(): number {
    return this.carouselDimensions.cardWidth;
  }

  /**
   * Getter para acceder al gap entre tarjetas desde el template
   */
  get cardGap(): number {
    return this.carouselDimensions.cardGap;
  }

  /**
   * Getter para verificar si es móvil (para usar en el template)
   */
  get isMobile(): boolean {
    return this.currentBreakpoint === 'mobile';
  }

  /**
   * Getter para verificar si es tablet o mayor
   */
  get isTabletOrLarger(): boolean {
    return this.currentBreakpoint !== 'mobile';
  }

  /**
   * Inicializa la suscripción a la cuenta regresiva
   */
  private initializeCountdown(): void {
    if (this.countdownSubscription && !this.countdownSubscription.closed) {
      this.countdownSubscription.unsubscribe();
    }

    this.countdownSubscription = interval(1000)
      .pipe(takeWhile(() => this.getDistance() >= 0))
      .subscribe({
        next: () => this.updateCountdown(),
        complete: () => this.onCountdownEnd()
      });

    this.updateCountdown();
  }

  /**
   * Inicia el auto-deslizamiento del carrusel
   */
  private startAutoSlide(): void {
    if (this.autoSlideSubscription && !this.autoSlideSubscription.closed) {
      this.autoSlideSubscription.unsubscribe();
    }

    this.autoSlideSubscription = interval(4000)
      .pipe(takeWhile(() => this.isAutoSliding))
      .subscribe(() => {
        if (!this.isDragging && !this.isHovering) {
          this.nextProduct();
        }
      });
  }

  /**
   * Limpia todas las suscripciones
   */
  private cleanup(): void {
    if (this.countdownSubscription) {
      this.countdownSubscription.unsubscribe();
    }
    if (this.autoSlideSubscription) {
      this.autoSlideSubscription.unsubscribe();
    }
  }

  /**
   * Calcula la distancia de tiempo restante
   */
  private getDistance(): number {
    const now = new Date().getTime();
    return this.countdownEndDate.getTime() - now;
  }

  /**
   * Actualiza el objeto countdown
   */
  private updateCountdown(): void {
    const distance = this.getDistance();

    if (distance < 0) {
      this.countdown = { days: 0, hours: 0, minutes: 0, seconds: 0 };
      return;
    }

    this.countdown.days = Math.floor(distance / (1000 * 60 * 60 * 24));
    this.countdown.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    this.countdown.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    this.countdown.seconds = Math.floor((distance % (1000 * 60)) / 1000);
  }

  /**
   * Se ejecuta cuando termina la cuenta regresiva
   */
  private onCountdownEnd(): void {
    console.log("¡La oferta ha terminado!");
    this.cleanup();
  }

  // Getters para el template

  get currentProduct(): Product {
    return this.products[this.currentIndex];
  }

  get formattedDays(): string {
    return this.countdown.days.toString().padStart(2, '0');
  }

  get formattedHours(): string {
    return this.countdown.hours.toString().padStart(2, '0');
  }

  get formattedMinutes(): string {
    return this.countdown.minutes.toString().padStart(2, '0');
  }

  get formattedSeconds(): string {
    return this.countdown.seconds.toString().padStart(2, '0');
  }

  // Métodos públicos

  onComprarClick(): void {
    console.log('Navegando a la página de compra del producto:', this.currentProduct.title);
    alert(`¡Comprando ${this.currentProduct.title}!`);
  }

  nextProduct(): void {
    this.setCurrentIndex((this.currentIndex + 1) % this.products.length);
  }

  prevProduct(): void {
    this.setCurrentIndex((this.currentIndex - 1 + this.products.length) % this.products.length);
  }

  goToProduct(index: number): void {
    this.setCurrentIndex(index);
  }

  /**
   * Establece el índice actual y actualiza la posición
   */
  private setCurrentIndex(index: number): void {
    this.currentIndex = index;
    if (this.carouselContainer && !this.isDragging) {
      this.updateCarouselPosition();
    }
  }

  /**
   * Actualiza la posición del carrusel
   */
  private updateCarouselPosition(): void {
    const translateX = -this.currentIndex * (this.carouselDimensions.cardWidth + this.carouselDimensions.cardGap);
    this.setCarouselTransition(true);
    this.carouselContainer.nativeElement.style.transform = `translateX(${translateX}px)`;
  }

  /**
   * Controla las transiciones del carrusel
   */
  private setCarouselTransition(enabled: boolean): void {
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.style.transition = enabled
        ? 'transform 0.5s ease-out'
        : 'none';
    }
  }

  productImageError(product: Product, event: Event): void {
    const img = event.target as HTMLImageElement;
    img.onerror = null;
    img.src = `https://placehold.co/350x450/e5e7eb/6b7280?text=${encodeURIComponent(product.title)}`;
  }

  // Métodos de hover para auto-slide

  onCarouselMouseEnter(): void {
    this.isHovering = true;
  }

  onCarouselMouseLeave(): void {
    this.isHovering = false;
  }

  toggleAutoSlide(): void {
    this.isAutoSliding = !this.isAutoSliding;
    if (this.isAutoSliding) {
      this.startAutoSlide();
    } else {
      if (this.autoSlideSubscription) {
        this.autoSlideSubscription.unsubscribe();
      }
    }
  }

  // Métodos de arrastre optimizados para móvil

  @HostListener('mousedown', ['$event'])
  onMouseDown(event: MouseEvent): void {
    if (this.carouselContainer && this.isCarouselEvent(event.target as Element)) {
      this.startDrag(event.pageX);
      event.preventDefault();
    }
  }

  @HostListener('window:mousemove', ['$event'])
  onMouseMove(event: MouseEvent): void {
    if (this.isDragging) {
      this.updateDrag(event.pageX);
      event.preventDefault();
    }
  }

  @HostListener('window:mouseup')
  onMouseUp(): void {
    if (this.isDragging) {
      this.endDrag();
    }
  }

  @HostListener('touchstart', ['$event'])
  onTouchStart(event: TouchEvent): void {
    if (this.carouselContainer && this.isCarouselEvent(event.target as Element)) {
      this.startDrag(event.touches[0].pageX);
    }
  }

  @HostListener('touchmove', ['$event'])
  onTouchMove(event: TouchEvent): void {
    if (this.isDragging) {
      this.updateDrag(event.touches[0].pageX);
      event.preventDefault();
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent): void {
    if (this.isDragging) {
      this.endDrag();
    }
  }

  /**
   * Verifica si el evento ocurrió dentro del carrusel
   */
  private isCarouselEvent(target: Element): boolean {
    if (!this.carouselContainer) return false;
    return this.carouselContainer.nativeElement.contains(target);
  }

  /**
   * Inicia el proceso de arrastre
   */
  private startDrag(startX: number): void {
    this.isDragging = true;
    this.startX = startX;
    this.startTranslateX = -this.currentIndex * (this.carouselDimensions.cardWidth + this.carouselDimensions.cardGap);
    this.setCarouselTransition(false);

    // Cambiar cursor
    if (this.carouselContainer) {
      this.carouselContainer.nativeElement.style.cursor = 'grabbing';
    }
  }

  /**
   * Actualiza la posición durante el arrastre
   */
  private updateDrag(currentX: number): void {
    if (!this.isDragging || !this.carouselContainer) return;

    const deltaX = currentX - this.startX;
    this.currentTranslateX = this.startTranslateX + deltaX;

    // Aplicar resistencia en los bordes
    let resistance = 1;
    const maxTranslate = 0;
    const minTranslate = -(this.products.length - 1) * (this.carouselDimensions.cardWidth + this.carouselDimensions.cardGap);

    if (this.currentTranslateX > maxTranslate) {
      resistance = 0.3;
      this.currentTranslateX = maxTranslate + (this.currentTranslateX - maxTranslate) * resistance;
    } else if (this.currentTranslateX < minTranslate) {
      resistance = 0.3;
      this.currentTranslateX = minTranslate + (this.currentTranslateX - minTranslate) * resistance;
    }

    this.carouselContainer.nativeElement.style.transform = `translateX(${this.currentTranslateX}px)`;
  }

  /**
   * Finaliza el proceso de arrastre
   */
  private endDrag(): void {
    if (!this.isDragging || !this.carouselContainer) return;

    this.isDragging = false;

    // Restaurar cursor
    this.carouselContainer.nativeElement.style.cursor = 'grab';

    // Calcular el índice más cercano
    const cardTotalWidth = this.carouselDimensions.cardWidth + this.carouselDimensions.cardGap;
    const deltaX = this.currentTranslateX - this.startTranslateX;
    let newIndex = this.currentIndex;

    // Si el arrastre supera el umbral, cambiar de índice
    if (Math.abs(deltaX) > this.dragThreshold) {
      if (deltaX > 0) { // Arrastre hacia la derecha (producto anterior)
        newIndex = Math.max(0, this.currentIndex - 1);
      } else { // Arrastre hacia la izquierda (producto siguiente)
        newIndex = Math.min(this.products.length - 1, this.currentIndex + 1);
      }
    }

    // Aplicar la nueva posición
    this.setCurrentIndex(newIndex);
  }

  /**
   * Previene el comportamiento por defecto en elementos de imagen
   */
  @HostListener('dragstart', ['$event'])
  onDragStart(event: DragEvent): void {
    event.preventDefault();
  }

  /**
   * Previene la selección de texto durante el arrastre
   */
  @HostListener('selectstart', ['$event'])
  onSelectStart(event: Event): void {
    if (this.isDragging) {
      event.preventDefault();
    }
  }

  /**
   * Maneja los eventos de rueda del mouse para navegación
   */
  @HostListener('wheel', ['$event'])
  onWheel(event: WheelEvent): void {
    if (this.isCarouselEvent(event.target as Element)) {
      event.preventDefault();

      // Throttle para evitar demasiados eventos
      if (event.deltaY > 0) {
        this.nextProduct();
      } else {
        this.prevProduct();
      }
    }
  }

  /**
   * Maneja eventos de teclado para navegación
   */
  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent): void {
    if (document.activeElement === this.carouselContainer?.nativeElement ||
        this.carouselContainer?.nativeElement.contains(document.activeElement)) {

      switch (event.key) {
        case 'ArrowLeft':
          event.preventDefault();
          this.prevProduct();
          break;
        case 'ArrowRight':
          event.preventDefault();
          this.nextProduct();
          break;
        case 'Home':
          event.preventDefault();
          this.goToProduct(0);
          break;
        case 'End':
          event.preventDefault();
          this.goToProduct(this.products.length - 1);
          break;
      }
    }
  }
}
