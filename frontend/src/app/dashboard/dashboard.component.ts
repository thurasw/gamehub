import { AfterViewInit, Component, OnInit } from '@angular/core';
import {
  trigger,
  state,
  style,
  group,
  query,
  animate,
  transition,
  // ...
} from '@angular/animations';
import { NgbSlideEvent } from '@ng-bootstrap/ng-bootstrap';
import { Title } from '@angular/platform-browser';
import { PromoService } from '../promo.service';
import { SpinnerService } from '../spinner/spinner.service';
import { GameService } from '../game.service';


@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css'],
  animations: [
    trigger('promo-slide-left', [
      state('visible', style({
        transform: 'translate3d(0, 0, 0)',
        opacity: 1
      })),
      state('invisible', style({
        transform: 'translate3d(-100%, 0, 0)',
        opacity: 0
      })),
      transition('visible => invisible', [
        animate('0.7s ease-out', style({
          transform: 'translate3d(50%, 0, 0)',
          opacity: 0
        }))
      ]),
      transition('invisible => visible', [
        animate('1s ease-in', style({
          transform: 'translate3d(-5%, 0, 0)',
          opacity: 1
        })),
        animate('5s ease', style({
          transform: 'translate3d(0, 0, 0)',
        }))
      ])
    ]),
    trigger('promo-slide-right', [
      state('visible', style({
        transform: 'translate3d(0, 0, 0)',
        opacity: 1
      })),
      state('invisible', style({
        transform: 'translate3d(100%, 0, 0)',
        opacity: 0
      })),
      transition('visible => invisible', [
        animate('0.7s ease-out', style({
          transform: 'translate3d(-50%, 0, 0)',
          opacity: 0
        }))
      ]),
      transition('invisible => visible', [
        animate('1s ease-in', style({
          transform: 'translate3d(5%, 0, 0)',
          opacity: 1
        })),
        animate('5s ease', style({
          transform: 'translate3d(0, 0, 0)',
        }))
      ])
    ])
  ]
})
export class DashboardComponent implements OnInit {

  currentSlideId: number;
  promos: Array<any> = [];

  trending: Array<any> = [];

  constructor(private titleService: Title, private promoService: PromoService, private gameService: GameService) { }

  ngOnInit(): void {
    this.titleService.setTitle("Game Hub")
    this.getPromos();
    this.getGames();
  }

  getPromos() {
    this.promoService.getPromos().subscribe(data => {
      this.promos = data;
      setTimeout(() => {
        if (this.promos && this.promos.length)
          this.currentSlideId = this.promos[0].id;
      }, 1)
    })
  }
  getGames() {
    this.gameService.getTrendingGames().subscribe(data => {
      this.trending = data;
    })
  }

  onSlide(event: NgbSlideEvent) {
    this.currentSlideId = parseInt(event.current);
  }
  isOdd(num: number) {
    return (num % 2) == 1;
  }
}
