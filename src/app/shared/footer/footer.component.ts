import { Component, OnInit, TemplateRef } from "@angular/core";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { UserService } from "src/app/service/user/user.service";
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: "app-footer",
  templateUrl: "./footer.component.html",
  styleUrls: ["./footer.component.css"],
})
export class FooterComponent implements OnInit {
  modalRef: BsModalRef;
  Modalconfig = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: "modalWidth contact-us",
  };
  ModalFbconfig = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: "modalWidth feedback",
  };
  ModalTmconfig = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: "modalWidth test-mon",
  };
  review: string = "";
  testimonials: string = "";
  email: string = "";
  info: string = "";

  sAttributes: any = {}
  newsNewsletterForm: FormGroup;

  constructor(
    private modalService: BsModalService,
    private service: UserService,
    private fb: FormBuilder,
    private toastr: ToastrService,
  ) {}

  get f(): any { return this.newsNewsletterForm.controls; }

  ngOnInit() {
    this.newsNewsletterForm = this.fb.group({
      email: ['', [Validators.required, Validators.pattern(/^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/)]],
    });
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.Modalconfig);
  }

  
  openFbModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.ModalFbconfig);
  }

  openTmModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.ModalTmconfig);
  }



  sendFeedBack() {
    this.service
      .sendFeedBack({
        email: this.email,
        feedback: this.review,
      })
      .subscribe((_response) => {
        alert(_response.body.message);
        this.decline();
      });
  }
  sendTestimonial() {
    this.service
      .sendTestimonial({
        email: this.email,
        testimonial: this.testimonials,
      })
      .subscribe((_response) => {
        alert(_response.body.message);
        this.decline();
      });
  }
  sendContactus() {
    this.service
      .sendTestimonial({
        email: this.email,
        info: this.info,
      })
      .subscribe((_response) => {
        alert(_response.body.message);
        this.decline();
      });
  }
  decline(): void {
    this.modalRef.hide();
    this.review = "";
    this.testimonials = "";
    this.info = "";
    this.email = "";
  }
  sendNesLatter() {
    if (this.newsNewsletterForm.invalid) {
      this.sAttributes.submitted = true
      return;
    }
    const query1 = this.newsNewsletterForm.value
    this.service.sendNewsletter(query1).subscribe(res => {
      if (res && res.status === 'OKAY') {
        this.toastr.success('success', 'Successfully added');
/*         if (res.data && res.data.ops) {
          const cData = res.data.ops[0];
          this.sAttributes.pageItems.splice(0, 0, cData);
        } */
      } else {
        this.toastr.error('error', res.errMsg);
      }
    }, err => {
      if (err && err.error && err.error.error && err.error.error.message) {
        this.toastr.error('error', err.error.error.message);
      }
    });
  }
}
