import { Component, OnInit, TemplateRef, ViewChild, ElementRef } from "@angular/core";
import { Router, NavigationEnd, ActivatedRoute } from "@angular/router";
import { BsModalService, BsModalRef, ModalOptions } from "ngx-bootstrap/modal";
import { ToastrService } from 'ngx-toastr';
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  AbstractControl,
} from "@angular/forms";
import { UserService } from "src/app/service/user/user.service";
import * as jwt_decode from "jwt-decode";
import { MustMatch } from "src/app/helpers/must-match.validator";
import { CookieService } from "angular2-cookie/core";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.css"],
})
export class HeaderComponent implements OnInit {
  @ViewChild('badge', null) badge: ElementRef;
  bsModalRef: BsModalRef;
  logo: string = "logo.svg";
  currentPage: boolean = false;
  currentRoute;
  modalRef: BsModalRef;
  blogRoute: boolean = false;
  forgetemail: string;
  ModelConfig: ModalOptions = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: "modelWidth",
  };
  calendarStartYear: number = 1960;
  calendarCurrentYear: number = new Date().getFullYear();
  selectedYear: number = new Date().getFullYear();
  selectedDate: number = new Date().getDate();
  selectedMonth: string = new Date().toLocaleString("default", {
    month: "long",
  });
  months: Array<any> = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  adultUser: boolean = false;
  enableEditUserInfo: boolean = false;
  enableEditGuardianInfo: boolean = false;
  registerForm: FormGroup;
  forgetpassword :FormGroup;
  loginForm: FormGroup;
  resetPasswordForm: FormGroup;
  userLogin: boolean = false;
  username: string = "";
  email: string;
  emailSend: boolean = false;
  enablePassword: boolean = false;
  enableUserForm: boolean = false;
  otp: string;
  password: string;
  submitted = false;
  enableSignOTP = false;
  enableSignInOTP = false;
  checkCookies = false;
  sAttributes: any={};

  //otp: string;
  showOtpComponent = true;
  @ViewChild('ngOtpInput', { static: false}) ngOtpInput: any;

  config = {
    allowNumbersOnly: true,
    length: 6,
    isPasswordInput: false,
    disableAutoFocus: false,
    placeholder: '',
    inputStyles: {
      'width': '50px',
      'height': '50px'
    }
  };

  constructor(
    private router: Router,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private _cookieService: CookieService,
    private toastr: ToastrService,
  ) {
    this.router.events.subscribe((evt) => {
      if (!(evt instanceof NavigationEnd)) {
        if (
          this.router.url == "/home" ||
          this.router.url == "/user-profile/my-reading" ||
          this.router.url == "/user-profile/my-submissions" ||
          this.router.url == "/user-profile/my-bookmarks" ||
          this.router.url == "/user-profile/my-profile" ||
          this.router.url == "/user-profile/write-publication" ||
          this.router.url == "/user-profile/my-desk" ||
          this.router.url == "/user-profile/edit-profile"
        ) {
          this.logo = "Full-Logo-WA.svg";
          this.currentPage = false;
          this.blogRoute = false;
          return;
        } else {
          const blogPage = this.router.url.split("/");

          if (blogPage[1] == "blogs") {
            this.logo = "logo.svg";
            this.blogRoute = true;
            this.currentPage = false;
          } else {
            this.logo = "logo.svg";
            this.blogRoute = false;
            this.currentPage = false;
          }
        }
      }
    });
  }

  get fv(): any { return this.loginForm.controls; }
  get fp(): any { return this.forgetpassword.controls; }
  get f(): any  { return this.registerForm.controls; }
  get rp(): any  { return this.resetPasswordForm.controls; }

  ngOnInit() {
    this.registerForm = this.formBuilder.group(
      {
        guardian: [
          "",

          this.conditionalValidator(
            () => this.enableEditGuardianInfo === true,
            Validators.required
          ),
        ],
        guardianFirstName: [
          "",

          this.conditionalValidator(
            () => this.enableEditGuardianInfo === true,
            Validators.required
          ),
        ],
        guardianLastName: [
          "",

          this.conditionalValidator(
            () => this.enableEditGuardianInfo === true,
            Validators.required
          ),
        ],
        guardianEmail: ["", [Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/), this.conditionalValidator(() => this.enableEditGuardianInfo === true, Validators.required),]],
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
        adultUser: [""],
        dob: [""],
        acceptOffer: ["", Validators.required],
        acceptTerms: [false, Validators.pattern("true")],
      },
      {
        validator: MustMatch("password", "confirmPassword"),
      }
    );

    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]],
      password: ["", Validators.required],
      remember: [false],
    });

    this.forgetpassword = this.formBuilder.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]]
    });

    this.resetPasswordForm = this.formBuilder.group({
      password: ["", Validators.required],
      confirmpassword: ["", Validators.required],
    },
    {
      validator: MustMatch("password", "confirmpassword")
    } 
    );



    this.registerForm.patchValue({
      adultUser: this.adultUser,
      dob: new Date(
        `${this.selectedYear}/${this.selectedMonth}/${this.selectedDate}`
      ),
      acceptOffer: "1",
    });

    const token = localStorage.getItem("token");
    if (token) {
      this.userLogin = true;
      if (this.userLogin) {
        this.getUserName();
      }
    } else {
      this.userLogin = false;
    }

    const email = this.getCookie("email");
    const password = this.getCookie("password");
    if (email != "" && password != "") {
      this.loginForm.patchValue({
        email: email,
        password: password,
        remember: true,
      });
    }
  }



  getCookie(key: string) {
    return this._cookieService.get(key);
  }
  setCookies() {
    if (this.loginForm.value.remember === true) {
      //console.log("remove");
      this._cookieService.put("email", "");
      this._cookieService.put("password", "");
    } else {
      //console.log("set");
      this._cookieService.put("email", this.loginForm.value.email);
      this._cookieService.put("password", this.loginForm.value.password);
    }
  }

  guradianValidation() {
    console.log("validation applied");
    this.registerForm = this.formBuilder.group(
      {
        guardian: [
          "",
          this.conditionalValidator(
            () => this.enableEditGuardianInfo === true,
            Validators.required
          ),
        ],
        guardianFirstName: [
          "",
          this.conditionalValidator(
            () => this.enableEditGuardianInfo === true,
            Validators.required
          ),
        ],
        guardianLastName: [
          "",
          this.conditionalValidator(
            () => this.enableEditGuardianInfo === true,
            Validators.required
          ),
        ],
        guardianEmail: [
          "",
          this.conditionalValidator(
            () => this.enableEditGuardianInfo === true,
            Validators.required
          ),
        ],
        firstName: ["", Validators.required],
        lastName: ["", Validators.required],
        email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]],
        password: ["", Validators.required],
        confirmPassword: ["", Validators.required],
        adultUser: [""],
        dob: [""],
        acceptOffer: ["", Validators.required],
        acceptTerms: [false, Validators.pattern("true")],
      },
      {
        validator: [
          MustMatch("password", "confirmPassword"),
          MustMatch("guardianPassword", "guardianConfirmPassword"),
        ],
      }
    );
  }

  conditionalValidator(
    condition: () => boolean,
    validator: ValidatorFn
  ): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } => {
      if (!condition()) {
        return null;
      }
      return validator(control);
    };
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) {
      return;
    }

    this.registerForm.patchValue({
      dob: new Date(
        `${this.selectedYear}/${this.selectedMonth}/${this.selectedDate}`
      ),
    });
    let json = this.registerForm.value;
    this.email = json.email;
    // json.dob = formatDate;

    this.userService.register(json).subscribe((_response) => {
      if (_response.body.message === "User already exist!") {
        this.enableSignOTP = true;
        this.enableUserForm = false;
      }
      if (_response.body.message === "Please verify account first") {
        this.enableSignOTP = true;
        this.enableUserForm = false;
      }
      if (_response.body.status == "Success") {
        //alert(_response.body.message);
        // this.decline();
        this.registerForm.reset();
        this.enableUserForm = false;
        this.enableSignOTP = true;
      } else {
        //alert(_response.body.message);
      }
    });
  }


  onSubmitLogin(): void {
    if (this.loginForm.invalid) {
      this.sAttributes.submitted = true
      return;
    }
    let json = this.loginForm.value;
    this.email = json.email;

    this.userService.login(json).subscribe((_response) => {
      if (_response.status == 200 && _response.body.status == "Success") {
        this.userLogin = true;
        const token = _response.body.data.token;
        const { firstName } = jwt_decode(token);
        this.username = firstName;
        localStorage.setItem("token", _response.body.data.token);
        //alert(_response.body.message);
        this.decline();
        this.loginForm.reset();

        this.router.routeReuseStrategy.shouldReuseRoute = () => false;
        this.router.onSameUrlNavigation = "reload";
        this.router.navigate(["/home"]);
      }

      if(_response.status == 200 && _response.body.status == 'Failure') {
        this.toastr.error('Oops! The Username and/or Password does not match. Please try again!');
      }

      if (_response.body.message === "Please verify account first") {
        this.enableSignInOTP = true;
      }
    });
  }

  setUserName(name) {
    console.log("DEBUGGGER CALLed");
    this.username = name;
  }

  checkPassword(group: FormGroup) {
    // here we have the 'passwords' group
    let pass = group.get("password").value;
    let confirmPass = group.get("confirmPassword").value;

    return pass === confirmPass ? null : { notSame: true };
  }

  openModal(template: TemplateRef<any>) {
    const email = this.getCookie("email");
    const password = this.getCookie("password");
    if (email != "" && password != "") {
      this.loginForm.patchValue({
        email: email,
        password: password,
        remember: true,
      });
    }
    this.selectedYear = new Date().getFullYear();
    this.selectedDate = new Date().getDate();
    this.selectedMonth = new Date().toLocaleString("default", {
      month: "long",
    });
    this.modalRef = this.modalService.show(template, this.ModelConfig);
  }

  getYears() {
    let years: number[] = [];
    for (let i = this.calendarStartYear; i <= this.calendarCurrentYear; i++) {
      years.push(i);
    }
    return years;
  }

  getDates() {
    let days: number[] = [];
    const dateCurMonth = this.getMonthDates();
    for (let i = 1; i <= dateCurMonth; i++) {
      days.push(i);
    }
    return days;
  }

  getMonthDates() {
    const month = this.months.findIndex((month) => month == this.selectedMonth);
    const dateCurrentMonth = new Date(this.selectedYear, month, 0).getDate();
    return dateCurrentMonth;
  }

  calculateAge() {
    const today = new Date();
    const dateString = `${this.selectedYear}/${this.selectedMonth}/${this.selectedDate}`;
    const birthDate = new Date(dateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    this.enableEditUserInfo = true;
    if (age >= 18) {
      this.enableUserForm = true;
      this.adultUser = true;
      this.enableEditGuardianInfo = false;
    } else {
      this.adultUser = false;
      this.enableEditGuardianInfo = true;
    }
    return age;
  }

  showUserForm() {
    this.submitted = true;
    if (
      this.registerForm.controls["guardian"].valid &&
      this.registerForm.controls["guardianFirstName"].valid &&
      this.registerForm.controls["guardianLastName"].valid &&
      this.registerForm.controls["guardianEmail"].valid
    ) {
      console.log("Valid!");
      this.enableUserForm = true;
      this.enableEditGuardianInfo = false;
    }

    // this.enableUserForm = true;

    if (this.registerForm.invalid) {
      return;
    }
    // const age = this.calculateAge();
    // age < 18 ? (this.enableUserForm = false) : (this.enableUserForm = true);
  }
  decline(): void {
    this.enableEditGuardianInfo = false;
    this.enableEditUserInfo = false;
    this.enablePassword = false;
    this.emailSend = false;
    this.adultUser = false;
    this.modalRef.hide();
    this.submitted = false;
    this.enableSignOTP = false;
    this.enableSignInOTP = false;
    this.otp = "";
    this.email = "";
  }

  logout() {
    localStorage.removeItem("token");
    this.userLogin = false;
    this.router.routeReuseStrategy.shouldReuseRoute = () => false;
    this.router.onSameUrlNavigation = "reload";
    this.router.navigate(["/home"]);
    // this.router.navigateByUrl("/home");
  }

  sendEmail(resent, type?) {
    this.sAttributes.type = type
    if (this.forgetpassword.invalid) {
      this.sAttributes.rpsubmitted  = true;
      return;
    }
    this.email = this.forgetpassword.value;
    this.sAttributes.email = this.forgetpassword.value.email
   // console.log(this.forgetpassword.value);
    const data = { email: this.email };
    if (type == "signup") {
      this.userService.reSendOTP(data).subscribe((_response) => {
        if (_response.body.status == "Failure") {
          this.toastr.error(_response.body.message);
        } else {
          this.toastr.success(_response.body.message);
          this.emailSend = true;
        }
      });
    } else {
      this.userService.sendEmail(data).subscribe((_response) => {
        if (_response.body.status == "Failure") {
          this.toastr.error(_response.body.message);
        } else {
          this.toastr.success(_response.body.message);
          this.emailSend = true;
        }
      });
    }
  }

  reSendOtp() {
    if (this.sAttributes.email) {
      const data = { email: this.sAttributes.email };
      this.userService.reSendOTP(data).subscribe((_response) => {
        if (_response.body.status == "Failure") {
          this.toastr.error("Please enter correct email address");
        } else {
          this.toastr.success(_response.body.message);
        }
      });
    }
  }

  
  verifyForgetOTP() {
    const data = { email: this.email, otp: this.otp };
    this.userService.verifyOTP(data).subscribe((_response) => {
      if (_response.body.status === "Failure") {
        this.toastr.error('error', _response.body.message);
      } else {
        this.enablePassword = true;
        this.toastr.success('success', _response.body.message);
      }
      //alert(_response.body.message);
    });
  }

  updatePassword() {
    if (this.resetPasswordForm.invalid) {
      this.sAttributes.resetPasswordubmitted = true;
      return;
    }
    this.email =  this.forgetemail;
    this.password= this.resetPasswordForm.value.password;
    const data = { email: this.email, password: this.password };
    this.userService.updatePassword(data).subscribe((res) => {
      if (res && res.body.status == 'Success') {
        this.toastr.success('success', res.body.message);
        this.sAttributes.resetSuccess = true
        setTimeout(() => {
        //alert(_response.body.message);
        this.decline();
        this.emailSend = false;
        this.email = "";
        this.password = "";
        this.otp = "";
        this.sAttributes.resetSuccess = false
        }, 2000);
      } else {
        this.toastr.error('error', res.body.message);
      }
    });
  }

  getUserName() {
    this.userService
      .get()
      .subscribe((_response) => this.changeName(_response.body.data[0]));
  }
  private changeName(data): void {
    if(typeof data == 'undefined') {
      this.username = 'User';
    } else {
      this.username =
      data && data.selectDisplayName === true
        ? data.displayName
        : `${data.firstName} ${data.lastName} `;
    }
    
  }

  onOtpChange(otp) {
    this.otp = otp;
    if(this.otp.length > 5) {
      //console.log(data)
      if (!this.emailSend) {
        const data = { email: this.email, otp: this.otp };
        this.forgetemail = this.email;
        this.userService.verifySignupOTP(data).subscribe((_response) => {
          if (_response.body.status === "Failure") {
            this.toastr.error('error', _response.body.message);
            this.sAttributes.otpWrong = true
          } else {
            this.toastr.success('success', _response.body.message);
            if (this.enableSignOTP) {
              this.sAttributes.otpWrong = false
              this.sAttributes.otpSuccess = true
              setTimeout(() => {
                this.decline();
              }, 2000);
            }
          }
          //alert(_response.body.message);
        });
      } else {
        this.forgetemail =  this.forgetpassword.value.email;
        const data = { email: this.forgetpassword.value.email, otp: this.otp };
        this.userService.verifyOTP(data).subscribe((_response) => {
          if (_response.body.status === "Failure") {
            this.toastr.error('error', _response.body.message);
            this.sAttributes.otpWrong = true
          } else {
            this.toastr.success('success', _response.body.message);
            //if (this.enableSignOTP) {
              this.sAttributes.otpWrong = false
              this.sAttributes.otpSuccess = true
              this.enablePassword = true;
          }
          //alert(_response.body.message);
        });
      }
    }
  }

  setVal(val) {
    this.ngOtpInput.setValue(val);
  }

  onConfigChange() {
    this.showOtpComponent = false;
    this.otp = null;
    setTimeout(() => {
      this.showOtpComponent = true;
    }, 0);
  }

   tAndCOpen() {
    this.bsModalRef = this.modalService.show(this.badge, { class: 'challengepop__pop' });
  }

  tAndCClose() {
    this.bsModalRef.hide()
  } 




}
