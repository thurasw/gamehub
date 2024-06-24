import { Component, Injectable, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { NgbDateParserFormatter, NgbDateStruct } from '@ng-bootstrap/ng-bootstrap';
import { AuthService } from 'src/app/auth.service';

@Injectable()
export class CustomDateParserFormatter extends NgbDateParserFormatter {

  readonly DELIMITER = '/';

  parse(value: string): NgbDateStruct | null {
    if (value) {
      let date = value.split(this.DELIMITER);
      return {
        day : parseInt(date[0], 10),
        month : parseInt(date[1], 10),
        year : parseInt(date[2], 10)
      };
    }
    return null;
  }

  format(date: NgbDateStruct | null): string {
    return date ? date.day + this.DELIMITER + date.month + this.DELIMITER + date.year : '';
  }
}

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css'], 
  providers: [{provide: NgbDateParserFormatter, useClass: CustomDateParserFormatter}]
})
export class SignupComponent implements OnInit {

  dateOfBirth: NgbDateStruct;
  maxDate: NgbDateStruct;
  minDate: NgbDateStruct;
  startDate: NgbDateStruct;

  signupForm: FormGroup;
  persistCheck = new FormControl(false);

  errorText: string = "";

  constructor(private fb: FormBuilder, private authService: AuthService, private titleService: Title, private router: Router) { }

  ngOnInit(): void {
    this.titleService.setTitle("Signup | Game Hub")

    let today = new Date();
    this.maxDate = {year: today.getUTCFullYear(), month: today.getMonth()+1, day: today.getDate()};
    this.minDate = {year: today.getUTCFullYear() - 100, month: 1, day: 1};
    this.startDate={year: today.getUTCFullYear() - 20, month: today.getUTCMonth()+1, day: 1};

    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(12)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })
  }

  signup(dp) {
    let userErrors = this.signupForm.controls['username'].errors;
    let emailErrors = this.signupForm.controls['email'].errors;
    let pwErrors = this.signupForm.controls['password'].errors;

    if(userErrors) {
      if (userErrors.required) {
        this.errorText = "Please enter a username"
      }
      else {
        this.errorText = "The username must be 5-12 characters"
      }
    }
    else if(emailErrors) {
      this.errorText = "Please enter a valid email address"
    }
    else if (pwErrors) {
      if (pwErrors.required) {
        this.errorText = "Please enter a password"
      }
      else {
        this.errorText = "The password must be 6 or more characters"
      }
    }
    else if (dp.status === "INVALID" || !this.dateOfBirth) {
      this.errorText = "Invalid Date of Birth"
    }
    else {
      this.errorText = null;
      let dob = `${this.dateOfBirth.day}-${this.dateOfBirth.month}-${this.dateOfBirth.year}`
      this.authService.signup(Object.assign(this.signupForm.value, {dateOfBirth: dob}), this.persistCheck.value).toPromise()
      .then(res => {
        if (res.auth) {
          this.router.navigate(['verify'], {queryParams: {u: this.signupForm.value.username, p: this.persistCheck.value}});
        }
        else if (res.error) {
          this.errorText = res.error;
        }
      })
      .catch(err => {
        console.log(err);
        this.errorText = "Unexpected Error. Please try again"
      })
    }
  }
}
