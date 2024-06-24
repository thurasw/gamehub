import { Location } from '@angular/common'
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { CookieService } from 'ngx-cookie-service';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-signin',
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent implements OnInit {

  loginForm: FormGroup;
  errorText: string;

  persistCheck = new FormControl(false);

  constructor(private fb: FormBuilder, private authService: AuthService, private location: Location, private titleService: Title, private router: Router) { }

  ngOnInit(): void {
    this.titleService.setTitle("Login | Game Hub")
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    })
  }

  signin() {
    let userErrors = this.loginForm.controls['username'].errors;
    let pwErrors = this.loginForm.controls['password'].errors;

    if (userErrors && userErrors.required) {
      this.errorText = "Username is required"
    }
    else if (pwErrors && pwErrors.required) {
      this.errorText = "Password is required"
    }
    else {
      this.errorText = null;
      this.authService.login(this.loginForm.value, this.persistCheck.value).toPromise()
      .then(res => {
        if (res.auth) {
          this.location.back();
        }
        else if (res.auth === false) {
          this.router.navigate(['verify'], {queryParams: {u: this.loginForm.value.username, p: this.persistCheck.value}});
        }
        else {
          this.errorText = "Unexpected Error. Please try again."
        }
      })
      .catch(err => {
        this.errorText = "Incorrect username or password"
      })
    }
  }
  goBack() {
    this.location.back();
  }
  resetPw() {
    this.router.navigate(['reset-pw/email'], {queryParams: {p: this.persistCheck.value}});
  }
}
