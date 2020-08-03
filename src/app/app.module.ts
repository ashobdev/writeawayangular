import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { HeaderComponent } from "./shared/header/header.component";
import { LoginComponent } from "./modules/login/login.component";
import { ComponentsModule } from "./components/components.module";
import { AboutUsComponent } from "./modules/about-us/about-us.component";
import { TermAndConditionsComponent } from "./modules/term-and-conditions/term-and-conditions.component";

import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import {
  LocationStrategy,
  HashLocationStrategy,
  CommonModule,
  PathLocationStrategy,
} from "@angular/common";
import { SignupComponent } from "./modules/signup/signup.component";

import { ModalModule } from "ngx-bootstrap/modal";
import { FooterComponent } from "./shared/footer/footer.component";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClientModule } from "@angular/common/http";
import { ForgetPassComponent } from "./modules/forget-pass/forget-pass.component";

import { BsDropdownModule } from "ngx-bootstrap/dropdown";
import { CookieService } from "angular2-cookie/services/cookies.service";
import { Platform } from "@angular/cdk/platform";
import { EditorModule } from '@tinymce/tinymce-angular';
import { ToastrModule } from 'ngx-toastr';
import { NgOtpInputModule } from 'ng-otp-input';
import { ChangePasswordComponent } from './modules/change-password/change-password.component';

 

@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    LoginComponent,
    SignupComponent,
    FooterComponent,
    ForgetPassComponent,
    AboutUsComponent,
    TermAndConditionsComponent,
    ChangePasswordComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    CommonModule,
    ToastrModule,
    ComponentsModule,
    EditorModule,
    ModalModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    BsDropdownModule.forRoot(),
    ToastrModule.forRoot(), // ToastrModule added
    NgOtpInputModule,
  ],
  providers: [CookieService, Platform],
  bootstrap: [AppComponent],
})
export class AppModule {}
