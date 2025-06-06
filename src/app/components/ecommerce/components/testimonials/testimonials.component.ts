import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  comment: string;
}

@Component({
  selector: 'app-testimonials',
    imports: [
    CommonModule,           // Para *ngIf
    ReactiveFormsModule     // Para [formGroup] y reactive forms
  ],
  templateUrl: './testimonials.component.html',
  styleUrls: ['./testimonials.component.css']
})
export class TestimonialsComponent {

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Jane D.',
      avatar: 'https://storage.googleapis.com/a1aa/image/e9166e97-1b01-4a35-6c39-d7fff966fae7.jpg',
      comment: 'Amazing quality and fast shipping. Highly recommend Benzoom!'
    },
    {
      id: 2,
      name: 'James K.',
      avatar: 'https://storage.googleapis.com/a1aa/image/4592a44d-833a-408e-6cfe-92b750ed819c.jpg',
      comment: 'Great customer service and stylish products. Will buy again.'
    },
    {
      id: 3,
      name: 'Emily R.',
      avatar: 'https://storage.googleapis.com/a1aa/image/e9166e97-1b01-4a35-6c39-d7fff966fae7.jpg',
      comment: 'Love the variety and quality. The sale was a great bonus!'
    }
  ];

  currentTestimonial = 0;

  constructor() { }

  selectTestimonial(index: number): void {
    this.currentTestimonial = index;
  }

}
