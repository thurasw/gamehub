import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/auth.service';

@Component({
  selector: 'app-reset',
  templateUrl: './reset.component.html',
  styleUrls: ['./reset.component.css']
})
export class ResetComponent implements OnInit {

  constructor(private fb: FormBuilder, private authService: AuthService, private route: ActivatedRoute, private router: Router) { }

  username: string = null;
  
  ngOnInit(): void {
    this.myForm = this.fb.group({
      pin: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    })

    this.route.queryParams.subscribe(params => {
      this.username = params.u;
    })
  }

  errorText: string = "";
  myForm: FormGroup;

  resetPw() {
    this.authService.resetPw(this.myForm.value.password, this.username, this.myForm.value.pin).subscribe(data => {
      if (data.reset === true) {
        this.errorText = "";
        this.myForm.reset();

        this.router.navigateByUrl('/')
      }
      else if (data.reset === false) {
        this.errorText = "Incorrect Pin";
      }
      else {
        this.errorText = "An unexpected error occurred. Please try again."
      }
    })
  }
}
