import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'game-hub';

  constructor(private router: Router) {
  }

  checkRoute(route: string) {
    if (this.router.url.includes(route)) {
      return true
    }
    else return false;
  }
}
