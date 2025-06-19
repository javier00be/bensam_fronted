import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';

@Component({
  selector: 'app-newsletter',
  imports: [
    CommonModule,           // Para *ngIf, *ngFor
    ReactiveFormsModule     // Para [formGroup] y reactive forms
  ],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent implements OnInit, OnDestroy {

  whatsappForm: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  // Para manejar subscripciones y evitar memory leaks
  private destroy$ = new Subject<void>();

  // Configuración de WhatsApp
  private readonly defaultCountryCode = '+51'; // Perú
  private readonly whatsappMessage = '¡Hola! Me interesa recibir ofertas exclusivas y novedades 🛍️';

  constructor(private fb: FormBuilder) {
    this.whatsappForm = this.fb.group({
      phone: ['', [
        Validators.required,
        this.phoneValidator.bind(this)
      ]]
    });
  }

  ngOnInit(): void {
    // Escuchar cambios en el formulario para limpiar mensajes
    this.whatsappForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.clearMessages();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Validador personalizado para números de teléfono
   */
  private phoneValidator(control: AbstractControl): {[key: string]: any} | null {
    if (!control.value) {
      return null; // El required validator se encarga de esto
    }

    const phone = control.value.replace(/\s/g, '');

    // Regex para validar números de teléfono internacionales
    const phoneRegex = /^(\+\d{1,3})\d{9,15}$/;

    if (!phoneRegex.test(phone)) {
      return {
        invalidPhone: {
          value: control.value,
          message: 'El número debe incluir código de país y tener entre 9-15 dígitos'
        }
      };
    }

    // Validaciones adicionales para Perú
    if (phone.startsWith('+51')) {
      const peruPhoneRegex = /^\+51\d{9}$/;
      if (!peruPhoneRegex.test(phone)) {
        return {
          invalidPeruPhone: {
            value: control.value,
            message: 'Número peruano debe tener 9 dígitos después del +51'
          }
        };
      }
    }

    return null;
  }

  /**
   * Getter para acceder fácilmente al campo phone
   */
  get phone(): AbstractControl | null {
    return this.whatsappForm.get('phone');
  }

  /**
   * Getter para verificar si el formulario es válido
   */
  get isFormValid(): boolean {
    return this.whatsappForm.valid;
  }

  /**
   * Getter para obtener los errores del teléfono
   */
  get phoneErrors(): string[] {
    const errors: string[] = [];
    const phoneControl = this.phone;

    if (phoneControl?.errors && phoneControl.touched) {
      if (phoneControl.errors['required']) {
        errors.push('El número de WhatsApp es requerido');
      }
      if (phoneControl.errors['invalidPhone']) {
        errors.push(phoneControl.errors['invalidPhone'].message);
      }
      if (phoneControl.errors['invalidPeruPhone']) {
        errors.push(phoneControl.errors['invalidPeruPhone'].message);
      }
    }

    return errors;
  }

  /**
   * Maneja el input del teléfono con formato automático
   */
  onPhoneInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let value = target.value.replace(/\s/g, '');

    // Si no empieza con +, agregar código por defecto
    if (value && !value.startsWith('+')) {
      value = this.defaultCountryCode + value;
    }

    // Formatear con espacios para mejor legibilidad
    const formattedValue = this.formatPhoneNumber(value);

    // Actualizar el formulario
    this.whatsappForm.patchValue({ phone: formattedValue }, { emitEvent: false });

    // Actualizar el input visualmente
    target.value = formattedValue;
  }

  /**
   * Formatea el número de teléfono para mejor visualización
   */
  private formatPhoneNumber(phone: string): string {
    if (!phone) return '';

    let formatted = phone;

    // Formato para números peruanos: +51 999 888 777
    if (phone.startsWith('+51') && phone.length > 3) {
      const countryCode = phone.substring(0, 3);
      const number = phone.substring(3);

      if (number.length <= 3) {
        formatted = `${countryCode} ${number}`;
      } else if (number.length <= 6) {
        formatted = `${countryCode} ${number.substring(0, 3)} ${number.substring(3)}`;
      } else {
        formatted = `${countryCode} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
      }
    }
    // Formato genérico para otros países
    else if (phone.startsWith('+') && phone.length > 4) {
      const parts = phone.match(/^(\+\d{1,3})(.*)$/);
      if (parts) {
        const countryCode = parts[1];
        const number = parts[2];

        if (number.length <= 3) {
          formatted = `${countryCode} ${number}`;
        } else if (number.length <= 6) {
          formatted = `${countryCode} ${number.substring(0, 3)} ${number.substring(3)}`;
        } else {
          formatted = `${countryCode} ${number.substring(0, 3)} ${number.substring(3, 6)} ${number.substring(6)}`;
        }
      }
    }

    return formatted;
  }

  /**
   * Limpia los números del teléfono (remueve espacios y caracteres especiales excepto +)
   */
  private cleanPhoneNumber(phone: string): string {
    return phone.replace(/\s/g, '').replace(/[^\d+]/g, '');
  }

  /**
   * Genera la URL de WhatsApp
   */
  private generateWhatsAppUrl(phone: string): string {
    const cleanPhone = this.cleanPhoneNumber(phone);
    const encodedMessage = encodeURIComponent(this.whatsappMessage);
    return `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
  }

  /**
   * Limpia los mensajes de éxito y error
   */
  private clearMessages(): void {
    this.successMessage = '';
    this.errorMessage = '';
  }

  /**
   * Muestra mensaje de éxito
   */
  private showSuccess(message: string): void {
    this.successMessage = message;
    this.errorMessage = '';

    // Limpiar mensaje después de 4 segundos
    setTimeout(() => {
      this.successMessage = '';
    }, 4000);
  }

  /**
   * Muestra mensaje de error
   */
  private showError(message: string): void {
    this.errorMessage = message;
    this.successMessage = '';
    this.isSubmitting = false;
  }

  /**
   * Maneja el envío del formulario
   */
  onSubmit(): void {
    // Marcar todos los campos como touched para mostrar errores
    this.whatsappForm.markAllAsTouched();

    if (!this.isFormValid) {
      this.showError('Por favor corrige los errores en el formulario');
      return;
    }

    this.isSubmitting = true;
    this.clearMessages();

    try {
      const phone = this.whatsappForm.get('phone')?.value;

      if (!phone) {
        this.showError('Número de teléfono requerido');
        return;
      }

      // Validación adicional antes de enviar
      const cleanPhone = this.cleanPhoneNumber(phone);
      if (cleanPhone.length < 10) {
        this.showError('Número de teléfono demasiado corto');
        return;
      }

      // Generar URL de WhatsApp
      const whatsappUrl = this.generateWhatsAppUrl(phone);

      // Abrir WhatsApp en nueva ventana/tab
      const whatsappWindow = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');

      if (!whatsappWindow) {
        this.showError('No se pudo abrir WhatsApp. Por favor verifica tu bloqueador de ventanas emergentes.');
        return;
      }

      // Éxito
      this.showSuccess('¡Te hemos redirigido a WhatsApp! 🎉');

      // Limpiar formulario
      this.whatsappForm.reset();

      // Log para debugging (opcional)
      console.log('WhatsApp redirection successful:', {
        originalPhone: phone,
        cleanPhone: cleanPhone,
        url: whatsappUrl
      });

    } catch (error) {
      console.error('Error al procesar el formulario:', error);
      this.showError('Ocurrió un error inesperado. Por favor inténtalo nuevamente.');
    } finally {
      this.isSubmitting = false;
    }
  }

  /**
   * Método para limpiar el formulario manualmente
   */
  clearForm(): void {
    this.whatsappForm.reset();
    this.clearMessages();
  }

  /**
   * Método para obtener el estado del formulario (útil para debugging)
   */
  getFormStatus(): any {
    return {
      valid: this.whatsappForm.valid,
      touched: this.whatsappForm.touched,
      dirty: this.whatsappForm.dirty,
      errors: this.whatsappForm.errors,
      phoneValue: this.phone?.value,
      phoneErrors: this.phoneErrors
    };
  }
}
