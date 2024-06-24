import { Component, ElementRef, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import {
  trigger,
  state,
  style,
  animate,
  transition,
  // ...
} from '@angular/animations';
import { AuthService } from '../auth.service';
import { FormControl } from '@angular/forms';
import { GameService } from '../game.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { Subject, Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css'],
  animations: [
    trigger('search-bar-fill', [
      transition(':enter', [
        style({ width: '0', opacity: 0}),  // initial
        animate('0.5s ease-out',
          style({ width: '*', opacity: 1}))  // final
      ]),
      transition(':leave', [
        style({ width: '*', opacity: 1}),  // initial
        animate('0.5s ease-in',
          style({ width: '0', opacity: 0}))  // final
      ])
    ]),
    trigger('search-results', [
      transition(':enter', [
        style({ height: '0', opacity: 0}),  // initial
        animate('0.5s ease-out',
          style({ height: '*', opacity: 1}))  // final
      ]),
      transition(':leave', [
        style({ height: '*', opacity: 1}),  // initial
        animate('0.5s ease-in',
          style({ height: '0', opacity: 0}))  // final
      ])
    ])
  ]
})
export class NavbarComponent implements OnInit, OnDestroy {

  searching: boolean;
  searched: boolean;

  searchInput = new FormControl('');

  loggedIn: boolean;
  user: string;
  admin: boolean;

  @ViewChild("searchbar", {read: ElementRef}) searchbar: ElementRef;

  @Input() gameDetails: boolean;

  constructor(private authService: AuthService, private gameService: GameService, private router: Router) { }
  
  private sub: Subscription;
  private valueChanged: Subject<string> = new Subject<string>();

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {
    this.authService.auth().toPromise()
    .then(res => {
      if (res.user === false) {
        this.loggedIn = false;
      }
      else if (res.user) {
        this.loggedIn = true;
        this.user = res.user
        this.admin = res.role === "admin";
      }
    })
    .catch(err => {
      this.loggedIn = false;
    });

    this.sub = this.valueChanged
      .pipe(
        debounceTime(1000),
        distinctUntilChanged()
      )
      .subscribe(query => {
        if (!query) {
          this.searchResults = [];
          this.searched = false;
        }
        else this.search(query);
      });
  }
  logout() {
    this.authService.logout().subscribe(res => {
      window.location.reload();
    })
  }

  expandSearch(e) {
    e.stopPropagation();
    if (this.searching) {
      this.seeAllResults();
    }
    else {
      this.searching = true;
      setTimeout(() => {
        this.searchbar.nativeElement.focus();
        if (this.searchResults.length) {
          this.searched = true;
        };
      }, 1) 
    }
  }

  searchResults: Array<any> = [];
  search(query: string): void {
    this.gameService.searchGames(query).subscribe(res => {
      if (this.searching) {
        this.searched = true;
        this.searchResults = res;  
      }
    })
  }
  seeAllResults(): void {
    let query = this.searchInput.value;
    if (query) {
      this.searched = false;
      this.searching = false;
      this.router.navigate(['/search'], {queryParams: {query: query}})  
    }
  }
  getGameDetails(game: any): void {
    if (game) {
      this.searched = false;
      this.searching = false;
      this.router.navigate(['/game', game.slug]);
    }
  }
}
