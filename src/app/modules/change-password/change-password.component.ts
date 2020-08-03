import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MustMatch } from 'src/app/helpers/must-match.validator';
import { UserService } from 'src/app/service/user/user.service';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {

  changePassword: FormGroup;
  sAttributes: any={};
  constructor(
    private formBuilder: FormBuilder,
    private userService: UserService,
    private toastr: ToastrService,
    private router: Router,
    ) { }

  get f(): any  { return this.changePassword.controls; }

  ngOnInit() {
    this.getUserData()
    this.changePassword = this.formBuilder.group({
      password: ["", Validators.required],
      confirmpassword: ["", Validators.required],
    },
    {
      validator: MustMatch("password", "confirmpassword")
    } 
    );
  }

  getUserData() {
    this.userService
      .get()
      .subscribe((_response) => 
      this.sAttributes.pageItems = _response.body.data[0]
      );
  }

  updatePassword() {
    if (this.changePassword.invalid) {
      this.sAttributes.resetPasswordubmitted = true;
      return;
    }
    const data = {...this.changePassword.value, email: this.sAttributes.pageItems.email}
    this.userService.updatePassword(data).subscribe((res) => {
      if (res && res.body.status == 'Success') {
        this.toastr.success('success', res.body.message);
        this.logout()
      } else {
        this.toastr.error('error', res.body.message);
      }
    });
  }

  decline() {
    this.sAttributes.resetPasswordubmitted = false
    this.changePassword.reset()
  }

  logout() {
    localStorage.removeItem("token");
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.navigate(["/home"]);
    setTimeout(() => {
      location.reload();
    },0);
    //this.toastr.success('success', 'Please Login');
  }

}
