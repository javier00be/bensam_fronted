import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-monthly-discounts',
  templateUrl: './monthly-discounts.component.html',
  styleUrls: ['./monthly-discounts.component.css']
})
export class MonthlyDiscountsComponent implements OnInit, OnDestroy {

  countdown = {
    days: 2,
    hours: 6,
    minutes: 5,
    seconds: 10
  };

  private intervalId: any;

  constructor() { }

  ngOnInit(): void {
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private startCountdown(): void {
    this.intervalId = setInterval(() => {
      if (this.countdown.seconds > 0) {
        this.countdown.seconds--;
      } else if (this.countdown.minutes > 0) {
        this.countdown.minutes--;
        this.countdown.seconds = 59;
      } else if (this.countdown.hours > 0) {
        this.countdown.hours--;
        this.countdown.minutes = 59;
        this.countdown.seconds = 59;
      } else if (this.countdown.days > 0) {
        this.countdown.days--;
        this.countdown.hours = 23;
        this.countdown.minutes = 59;
        this.countdown.seconds = 59;
      }
    }, 1000);
  }

  onComprarClick(): void {
    // Lógica para comprar
    console.log('Comprar clicked');
  }

}
