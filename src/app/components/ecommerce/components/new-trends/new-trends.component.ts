import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
  rating: number;
}

@Component({
  selector: 'app-new-trends',
    imports: [
    CommonModule,           // Para *ngIf
    ReactiveFormsModule     // Para [formGroup] y reactive forms
  ],
  templateUrl: './new-trends.component.html',
  styleUrls: ['./new-trends.component.css']
})
export class NewTrendsComponent {

  products: Product[] = [
    {
      id: 1,
      name: 'Traje Negro',
      price: 120.00,
      image: 'https://storage.googleapis.com/a1aa/image/81e73e8c-4a51-4281-a340-bfc126044c97.jpg',
      rating: 4.5
    },
    {
      id: 2,
      name: 'Vestido Beige',
      price: 80.00,
      image: 'https://storage.googleapis.com/a1aa/image/0fa080d2-b8eb-4aba-2023-6ba72494f604.jpg',
      rating: 4.5
    },
    {
      id: 3,
      name: 'Blusa Estampada',
      price: 45.00,
      image: 'https://storage.googleapis.com/a1aa/image/e09ff92e-7877-4833-c61d-e0cfb3e7d4db.jpg',
      rating: 4.5
    },
    {
      id: 4,
      name: 'Camisa Blanca',
      price: 35.00,
      image: 'https://storage.googleapis.com/a1aa/image/000bbb97-0d92-4640-ddb4-efb09e4a2f5c.jpg',
      rating: 4.5
    },
    {
      id: 5,
      name: 'Vestido Azul',
      price: 90.00,
      image: 'https://storage.googleapis.com/a1aa/image/dd68ceb8-c8dd-4391-baf1-1e15d339c245.jpg',
      rating: 4.5
    },
    {
      id: 6,
      name: 'Top Colorido',
      price: 70.00,
      image: 'https://storage.googleapis.com/a1aa/image/dab16b90-cdd7-4863-0724-49bd2a8f174d.jpg',
      rating: 4.5
    },
    {
      id: 7,
      name: 'Suéter Blanco',
      price: 85.00,
      image: 'https://storage.googleapis.com/a1aa/image/0c08ec96-2fa3-4d71-8aaa-887475bb57af.jpg',
      rating: 4.5
    }
  ];

  constructor() { }

  onComprarClick(): void {
    // Lógica para comprar
    console.log('Comprar clicked');
  }

  getStarArray(rating: number): number[] {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    const totalStars = 5;

    const stars = [];
    for (let i = 0; i < fullStars; i++) {
      stars.push(1);
    }
    if (hasHalfStar) {
      stars.push(0.5);
    }
    while (stars.length < totalStars) {
      stars.push(0);
    }

    return stars;
  }

}
