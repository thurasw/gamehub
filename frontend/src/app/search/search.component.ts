import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../game.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.css']
})
export class SearchComponent implements OnInit {

  constructor(private route: ActivatedRoute, private gameService: GameService, private router: Router) { }

  query: string = "";
  games: Array<any> = [];

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params.query;
      if (this.query) {
        this.search(this.query);
      }
      else {
        this.router.navigateByUrl('/')
      }
    })
  }

  search(query: string): void {
    this.gameService.searchGames(query).subscribe(res => {
      this.games = res;
    })
  }
}
