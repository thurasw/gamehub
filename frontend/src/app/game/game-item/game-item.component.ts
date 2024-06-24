import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-game-item',
  templateUrl: './game-item.component.html',
  styleUrls: ['./game-item.component.css']
})
export class GameItemComponent implements OnInit {

  constructor() { }

  @Input() game: any;
  @Input() showTitle: boolean = true;
  @Input() small: boolean = false;

  ngOnInit(): void {
  }

}
