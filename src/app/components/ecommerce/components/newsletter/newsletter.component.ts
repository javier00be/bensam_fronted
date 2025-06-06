import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-newsletter',
    imports: [
    CommonModule,           // Para *ngIf
    ReactiveFormsModule     // Para [formGroup] y reactive forms
  ],
  templateUrl: './newsletter.component.html',
  styleUrls: ['./newsletter.component.css']
})
export class NewsletterComponent {

  newsletterForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.newsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.newsletterForm.valid) {
      const email = this.newsletterForm.get('email')?.value;
      console.log('Newsletter subscription:', email);
      // Aquí puedes agregar la lógica para enviar el email al backend
      this.newsletterForm.reset();
    }
  }

  get email() {
    return this.newsletterForm.get('email');
  }

}
