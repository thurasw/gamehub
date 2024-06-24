import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-email',
  templateUrl: './email.component.html',
  styleUrls: ['./email.component.css']
})
export class EmailComponent implements OnInit {

  constructor(private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
  }

  email = new FormControl('', [Validators.required, Validators.email]);
  errorText: string = "";

  sendEmail() {
    this.authService.sendPwResetEmail(this.email.value).subscribe(data => {
      if (data.user) {
        this.errorText = "";

        this.router.navigate(['reset-pw/reset'], {queryParams: {u: data.user}})
      }
      else {
        this.errorText = "An account with the specified email does not exist"
      }
    })
  }

}
