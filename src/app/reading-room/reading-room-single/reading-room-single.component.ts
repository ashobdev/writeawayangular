import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
//import { volumes } from './reading-model';
import { PublicationService } from "src/app/service/publications/publication.service";
import { ToastrService } from 'ngx-toastr';
import { DOCUMENT } from '@angular/common';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { UserService } from 'src/app/service/user/user.service';
import { ReaderService } from 'src/app/service/reader/reader.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
declare var $: any;
@Component({
  selector: 'app-reading-room-single',
  templateUrl: './reading-room-single.component.html',
  styleUrls: ['./reading-room-single.component.css']
})
export class ReadingRoomSingleComponent implements OnInit, AfterViewInit {
  @ViewChild('socialMedia', null) socialMedia: ElementRef;
  @ViewChild('aboutUser', null) aboutUser: ElementRef;
  @ViewChild('writeReview', null) writeReview: ElementRef;
  bsModalRef: BsModalRef;
  sAttributes: any = {}
  paginationIndex: number = 0
  fullPaginationIndex: number = 0
  readerRating: number;
  userRating: number;
  bookRating: number
  writeReviewForm: FormGroup;
  @ViewChild('fullScreen',{static: true}) divRef;

  

  constructor(
    private publicationService: PublicationService,
    private readerService: ReaderService,
    private toastr: ToastrService,
    private modalService: BsModalService,
    private userService: UserService,
    private fb: FormBuilder,
    @Inject(DOCUMENT) private document: any
    ) { }

    get f(): any { return this.writeReviewForm.controls; }
  
  ngOnInit() {
    this.getUserData()
    this.writeReviewForm = this.fb.group({
      review: ['', [Validators.required]],
    });
    this.readerRating = 1
    this.userRating = 1
    this.bookRating = 1
    this.sAttributes.currentUrl = window.location.href
    this.divRef = document.documentElement
    this.getReader()
    this.sAttributes.likeToggle = false
    this.sAttributes.bookMark = false
    this.sAttributes.readerLikeToggle = false
    this.sAttributes.readerBookMark = false
    this.sAttributes.readerRating = false
    this.sAttributes.rating = false
    
  }

  getUserData() {
    this.userService
      .get()
      .subscribe((_response) => 
      this.sAttributes.userLoginData = _response.body.data[0]
      );
  }

  ngAfterViewInit() {
    this.getReaderCount()
    this.getUserPublicationCount()
    for(let i=1; i < 6; i++) {
      (document.querySelector('label[for=star-'+i+'-reader-rating]') as HTMLElement).style.padding = '5px';
      (document.querySelector('label[for=star-'+i+'-reader-rating]') as HTMLElement).style.fontSize = '25px';
    }
    for(let i=1; i < 6; i++) {
      (document.querySelector('label[for=star-'+i+'-book-rating]') as HTMLElement).style.padding = '5px';
      (document.querySelector('label[for=star-'+i+'-book-rating]') as HTMLElement).style.fontSize = '25px';
    }
}

  getReader() {
      const queryObj: any = { };
      this.publicationService.getReaderRoom(queryObj).subscribe(res => {
            if (res && res.status === 'success') {
              this.sAttributes.readerPageItems = res.data[0]
              console.log(this.sAttributes.readerPageItems)
              this.sAttributes.userpublicationsPageItems = res.data[0].userpublications
              for(let k in this.sAttributes.userpublicationsPageItems) {
                let i = Number(k) + 1
                this.sAttributes.userpublicationsPageItems[k].sNo =  i;
              }
            if(this.sAttributes.readerPageItems._id) {
              this.sAttributes.userpublicationsId = this.sAttributes.userpublicationsPageItems[0]._id
              this.sAttributes.sericalNo =  this.sAttributes.userpublicationsPageItems[0].sNo
              this.sAttributes.readerId = this.sAttributes.readerPageItems._id
            }
            this.chunk(this.sAttributes.userpublicationsPageItems, 5)
        } else {
          this.toastr.error('error', res.errMsg);
        }
      }, err => {
        if (err && err.error && err.error.error && err.error.error.message) {
          this.toastr.error('error', err.error.error.message);
        }
      });
  }


  chunk(array, size) {
    const chunked_arr = [];
    let copied = [...array]; // ES6 destructuring
    const numOfChild = Math.ceil(copied.length / size); // Round up to the nearest integer
    for (let i = 0; i < numOfChild; i++) {
      chunked_arr.push(copied.splice(0, size));
    }
    this.sAttributes.chunck = chunked_arr
    if(chunked_arr.length >= 0) {
      this.sAttributes.readingTopic = chunked_arr;
      console.log(this.sAttributes.readingTopic)
    }
    
  }

  topicPagination(opration) {
    if (opration === '+') {
      this.paginationIndex++
    } else {
      this.paginationIndex--
    }
  }

  fullTopicPagination(opration) {
    if(this.sAttributes.sericalNo) {
      this.fullPaginationIndex = this.sAttributes.sericalNo - 1
    }
    if (opration === '+') {
      this.fullPaginationIndex++
    } else {
      this.fullPaginationIndex--
    }
    let paginationData = this.sAttributes.userpublicationsPageItems[this.fullPaginationIndex]
    this.sAttributes.readerId = this.sAttributes.readerPageItems._id
    this.sAttributes.userpublicationsId = paginationData._id
    this.sAttributes.sericalNo = paginationData.sNo
  }

  fullInfo(idx, sNo) {
    this.sAttributes.userpublicationsId = idx
    this.sAttributes.sericalNo = sNo
    this.getUserPublicationCount()
    setTimeout(() => {
      for(let i=1; i < 6; i++) {
        (document.querySelector('label[for=star-'+i+'-reader-rating]') as HTMLElement).style.padding = '5px';
        (document.querySelector('label[for=star-'+i+'-reader-rating]') as HTMLElement).style.fontSize = '25px';
      }
    },0);
  }

  openFullscreen() {
    this.sAttributes.fullScreen = true
    this.hideFullscreenEle()
    //console.log(this.divRef.requestFullscreen)
    if (this.divRef.requestFullscreen) {
      this.divRef.requestFullscreen();
    } else if (this.divRef.mozRequestFullScreen) {
      /* Firefox */
      this.divRef.mozRequestFullScreen();
    } else if (this.divRef.webkitRequestFullscreen) {
      /* Chrome, Safari and Opera */
      this.divRef.webkitRequestFullscreen();
    } else if (this.divRef.msRequestFullscreen) {
      /* IE/Edge */
      this.divRef.msRequestFullscreen();
    }
  }

    /* Close fullscreen */
    closeFullscreen() {
      this.removeHideEle()
      if (this.document.exitFullscreen) {
        this.document.exitFullscreen();
      } else if (this.document.mozCancelFullScreen) {
        /* Firefox */
        this.document.mozCancelFullScreen();
      } else if (this.document.webkitExitFullscreen) {
        /* Chrome, Safari and Opera */
        this.document.webkitExitFullscreen();
      } else if (this.document.msExitFullscreen) {
        /* IE/Edge */
        this.document.msExitFullscreen();
      }
    }

  hideFullscreenEle() {
    document.getElementById("header").style.display = "none";
    document.getElementById("hide1").style.display = "none";
    document.getElementById("hide2").style.display = "none";
    document.querySelector('footer').style.display = "none";
  }

  removeHideEle() {
    document.getElementById("header").style.display = "block";
    document.getElementById("hide1").style.display = "block";
    document.getElementById("hide2").style.display = "block";
    document.querySelector('footer').style.display = "block";
  }

  socialShareOpen() {
    this.bsModalRef = this.modalService.show(this.socialMedia, { class: 'challengepop__pop' });
  }
  openAboutUser(userData) {
    this.sAttributes.userData = userData
    this.bsModalRef = this.modalService.show(this.aboutUser, { class: 'aboutUser__pop' });
    this.getAge(userData.user[0].dob)
    setTimeout(() => {    //<<<---    using ()=> syntax
      for (let k = 1; k < 6; k++) {
        (document.querySelector('label[for=star-' + k + '-user-rating]') as HTMLElement).style.padding = '5px';
        (document.querySelector('label[for=star-' + k + '-user-rating]') as HTMLElement).style.fontSize = '25px';
      }
    },0);

  }

  openWrirteReview() {
    this.bsModalRef = this.modalService.show(this.writeReview, { class: 'aboutUser__pop' });
  }

  socialShareClose() {
    this.bsModalRef.hide()
    this.sAttributes.inputElement = ''
  }

  copyblogmessageUrl(inputElement) {
    inputElement.select();
    document.execCommand('copy');
    inputElement.setSelectionRange(0, 0);
    this.sAttributes.inputElement = inputElement.value
    //alert("Copied the text: " + inputElement.value);
  }

  getReaderCount() {
    const type = 'true'
    const queryObj: any = { type: type, readerId: this.sAttributes.readerId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
    this.readerService.updateReadCount(queryObj).subscribe(res => {});
  }

  getUserPublicationCount() {
    const type = 'true'
    const queryObj: any = { type: type, userpublicationId: this.sAttributes.userpublicationsId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
    this.readerService.updateUserpublicationCount(queryObj).subscribe(res => {});
  }

  saveReaderBookMark() {
    this.sAttributes.readerBookMark = true
    const type = String(this.sAttributes.readerBookMark)
    const queryObj: any = { type: type, readerId: this.sAttributes.readerId, user: this.sAttributes.userLoginData._id };
    this.readerService.saveReaderBookMark(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }

  updateReaderBookMark(bookMarkStatus) {
    if(bookMarkStatus) {
      this.sAttributes.readerBookMark = true
    }else {
      this.sAttributes.readerBookMark = false
    }
    const type = String(this.sAttributes.readerBookMark)
    const queryObj: any = { type: type, readerId: this.sAttributes.readerId, user: this.sAttributes.userLoginData._id };
    this.readerService.updateReaderBookMark(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }

  saveReaderLike() {
    this.sAttributes.readerLikeToggle = true
    const type = String(this.sAttributes.readerLikeToggle)
    const queryObj: any = { "likeStatus": type, "readerId": this.sAttributes.readerId, "user": this.sAttributes.userLoginData._id };
    console.log(queryObj)
     this.readerService.saveReaderLike(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    }); 
  }

  updateReaderLike(likeStatus) {
    if(likeStatus) {
      this.sAttributes.readerLikeToggle = true
    }else {
      this.sAttributes.readerLikeToggle = false
    }
    const type = String(this.sAttributes.readerLikeToggle)
    const queryObj: any = { type: type, readerId: this.sAttributes.readerId, user: this.sAttributes.userLoginData._id };
    this.readerService.updateReaderLike(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }



  saveReaderRating() {
    this.sAttributes.readerRating = true
    const type = String(this.sAttributes.readerRating)
    const queryObj: any = { type: type, readerId: this.sAttributes.readerId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
     this.readerService.saveReaderRating(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    }); 
  }


  updateReaderRating() {
    this.sAttributes.readerRating != this.sAttributes.readerRating
    const type = String(this.sAttributes.readerRating)
    const queryObj: any = { type: type, readerId: this.sAttributes.readerId, user: this.sAttributes.userLoginData._id };
    this.readerService.updateReaderRating(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }


  saveUserpublicationBookMark() {
    this.sAttributes.bookMark = true
    const type = String(this.sAttributes.bookMark)
    const queryObj: any = { type: type, userpublicationId: this.sAttributes.userpublicationsId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
    this.readerService.saveUserpublicationBookMark(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }

  updateUserpublicationBookMark() {
    const type = String(this.sAttributes.bookMark)
    const queryObj: any = { type: type, userpublicationId: this.sAttributes.userpublicationsId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
    this.readerService.updateUserpublicationBookMark(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }

  saveUserpublicationLike() {
    this.sAttributes.likeToggle = !this.sAttributes.likeToggle
    const type = String(this.sAttributes.bookMark)
    const queryObj: any = { type: type, userpublicationId: this.sAttributes.userpublicationsId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
    this.readerService.saveUserpublicationLike(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
        if(res.data.likeStatus) {
          this.sAttributes.likeToggle = true
        }else {
          this.sAttributes.likeToggle = false
        }
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }

  updateUserpublicationLike() {
    this.sAttributes.likeToggle = !this.sAttributes.likeToggle
    const type = String(this.sAttributes.bookMark)
    const queryObj: any = { type: type, userpublicationId: this.sAttributes.userpublicationsId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
    this.readerService.updateUserpublicationLike(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
        if(res.data.likeStatus) {
          this.sAttributes.likeToggle = true
        }else {
          this.sAttributes.likeToggle = false
        }
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }

  saveUserpublicationRating() {
    this.sAttributes.rating = true
    const type = String(this.sAttributes.readerRating)
    const queryObj: any = { type: type, userpublicationId: this.sAttributes.userpublicationsId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
     this.readerService.saveUserpublicationRating(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    }); 
  }


  updateUserpublicationRating() {
    this.sAttributes.rating != this.sAttributes.rating
    const type = String(this.sAttributes.rating)
    const queryObj: any = { type: type, userpublicationId: this.sAttributes.userpublicationsId, user: this.sAttributes.userLoginData._id };
    console.log(queryObj)
    this.readerService.updateUserpublicationRating(queryObj).subscribe(res => {
      console.log(res)
      if (res && res.status === 'Success') {
        this.toastr.success('Success', res.message);
      } else {
        this.toastr.error('error', res.message);
      }
    });
  }

  getAge(dob) {
    const bdate = new Date(dob);
    const timeDiff = Math.abs(Date.now() - bdate.getTime() );
    this.sAttributes.age = Math.floor((timeDiff / (1000 * 3600 * 24)) / 365);
    console.log(this.sAttributes.age )
  }

  sendFeedBack() {
    if (this.writeReviewForm.invalid) {
      this.sAttributes.submitted = true
      return;
    }
    const query1 = this.writeReviewForm.value
    console.log(query1)
  }


}
