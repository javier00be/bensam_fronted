import { Component } from '@angular/core';
import { HeroComponent } from '../components/hero/hero.component';
import { FeaturesComponent } from '../components/features/features.component';
import { MonthlyDiscountsComponent } from '../components/monthly-discounts/monthly-discounts.component';
import { NewTrendsComponent } from '../components/new-trends/new-trends.component';
import { TestimonialsComponent } from '../components/testimonials/testimonials.component';
import { NewsletterComponent } from '../components/newsletter/newsletter.component';


@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    HeroComponent,
    FeaturesComponent,
    MonthlyDiscountsComponent,
    NewTrendsComponent,
    TestimonialsComponent,
    NewsletterComponent
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor() { }

}
