import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-verify',
  templateUrl: './verify.component.html',
  styleUrls: ['./verify.component.css']
})
export class VerifyComponent implements OnInit {

  constructor(private route: ActivatedRoute, private authService: AuthService, private router: Router) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.username = params.u;
      this.persist = params.p;
      if (!this.username) {
        this.router.navigateByUrl('/signin');
      }
    })
  }

  username: string = null;
  persist: boolean = false;
  errorText: string = "";
  verificationPin = new FormControl("", [Validators.required]);

  sent: boolean = false;

  verify() {
    this.authService.verify(this.username, this.verificationPin.value, this.persist).subscribe(data => {
      if (data.verify === true) {
        this.errorText = "";
        this.verificationPin.reset();

        this.router.navigateByUrl('/');
      }
      else {
        this.errorText = "Incorrect Pin"
      }
    })
  }

  sendEmail() {
    this.authService.sendEmail(this.username).subscribe(data => {
      this.sent = true;
      setTimeout(() => {
        this.sent = false
      }, 30000)
    })
  }
}
