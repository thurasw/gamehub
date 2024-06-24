import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { DashboardComponent } from './dashboard/dashboard.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { SignupComponent } from './auth/signup/signup.component';
import { SigninComponent } from './auth/signin/signin.component';
import { GameImagePipe, PromoImagePipe, RatingColorPipe, UnixTimePipe, YoutubeVideoPipe } from './game.pipe';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { SearchComponent } from './search/search.component';
import { GameItemComponent } from './game/game-item/game-item.component';
import { GameDetailsComponent } from './game/game-details/game-details.component';
import { AdminComponent } from './admin/admin.component';
import { SpinnerComponent } from './spinner/spinner/spinner.component';
import { SpinnerInterceptor } from './spinner/spinner.interceptor';
import { OverlayModule } from '@angular/cdk/overlay';
import { VerifyComponent } from './auth/verify/verify.component';
import { EmailComponent } from './auth/reset-pw/email/email.component';
import { ResetComponent } from './auth/reset-pw/reset/reset.component';

@NgModule({
  declarations: [
    AppComponent,
    NavbarComponent,
    DashboardComponent,
    SignupComponent,
    SigninComponent,
    GameImagePipe,
    UnixTimePipe,
    YoutubeVideoPipe,
    PromoImagePipe,
    RatingColorPipe,
    SearchComponent,
    GameItemComponent,
    GameDetailsComponent,
    AdminComponent,
    SpinnerComponent,
    VerifyComponent,
    EmailComponent,
    ResetComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    NgbModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    OverlayModule
  ],
  entryComponents: [
    SpinnerComponent
  ],
  providers: [
    {provide: HTTP_INTERCEPTORS, useClass: SpinnerInterceptor, multi: true}
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
