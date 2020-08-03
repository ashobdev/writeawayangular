import { Component, OnInit, TemplateRef } from "@angular/core";
import { ActivatedRoute, Router, NavigationEnd } from "@angular/router";
import { PublicationService } from "src/app/service/publications/publication.service";
import { BsModalService, BsModalRef } from "ngx-bootstrap/modal";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import * as jwt_decode from "jwt-decode";
import { environment } from "../../../../environments/environment";
import { AngularEditorConfig } from '@kolkov/angular-editor';
@Component({
  selector: "app-write-publication",
  templateUrl: "./write-publication.component.html",
  styleUrls: ["./write-publication.component.css"],
})
export class WritePublicationComponent implements OnInit {
  url = environment.url;
  itemsPerSlide = 3;
  singleSlideOffset = false;
  noWrap = false;
  count: number = 0;
  sAttributes: any = {}
  maxMsglength: number;


  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '15rem',
    minHeight: '5rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    defaultParagraphSeparator: 'p',
    defaultFontName: 'Arial',
    toolbarHiddenButtons: [
      ['bold']
      ],
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };

  slidesChangeMessage = "";
  slides = [
    { image: "assets/images/write.svg" },
    { image: "assets/images/write.svg" },
    { image: "assets/images/write.svg" },
    { image: "assets/images/write.svg" },
    { image: "assets/images/write.svg" },
  ];

  editorData = "<p>t</p>";
  topic: string = "";
  mediaAvailable = []; // available genres select by user
  id; // publication id
  submissionId; // publication id
  userId;
  showGenres: boolean = true;
  data: Array<any> = [];
  suggestedPublication: Array<any> = [];
  followingPublication: Array<any> = [];
  writingPublication: Array<any> = [];

  modalRef: BsModalRef;
  Modelconfig = {
    backdrop: true,
    ignoreBackdropClick: true,
    class: "modelWidth",
  };
  submissionForm: FormGroup;
  editAble: boolean = false;
  copiedLink: string;
  kickStartInfo: string;
  recentWriting: Array<any> = [];
  following: Array<any> = [];

  constructor(
    private service: PublicationService,
    private activateRouter: ActivatedRoute,
    private modalService: BsModalService,
    private formBuilder: FormBuilder,
    private router: Router
  ) {}

  get f(): any  { return this.submissionForm.controls; }

  ngOnInit() {
    this.maxMsglength = 150
    this.id = this.activateRouter.snapshot.paramMap.get("id");
    // check user is login
    const token = localStorage.getItem("token");
    const { id } = jwt_decode(token);
    if (id) {
      this.userId = id;
    }
    if (this.id) {
      this.getPublication(this.id); //get single publication
      this.getSuggestedPublication(); // get suggested Publication
      this.getRecentWritingPublication(); // get user writing publication
      this.getFollowing(); // get user following publication
      this.router.events.subscribe((evt) => {
        if (!(evt instanceof NavigationEnd)) {
          return;
        }
        window.scrollTo(0, 0);
      });
    }

    this.submissionForm = this.formBuilder.group({
      topic: ['', [Validators.required]],
      content: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(this.maxMsglength)]],
      mediaAvailable: [''],
    });
    console.log(this.data)
  }

  getContent(event) {
    if(event.length >= this.maxMsglength) {
        this.config.editable = false
    }else {
      this.config.editable = true
    }
    this.editorData = event;
  }

  getPublication(id) {
    this.service.getOne(id).subscribe((_response) => {
      this.data = _response.body.data[0];
      this.kickStartInfo = this.data["kickstarter"];
      console.log("this", this.data["kickstarter"]);
      if (this.data["userPublication"] && this.data["userPublication"].length) {
        this.editAble = true;
        this.submissionId = this.data["userPublication"][0]["_id"];
        this.submissionForm.patchValue(this.data["userPublication"][0]);
        this.mediaAvailable = this.data["userPublication"][0]["mediaAvailable"];
        this.editorData = this.data["userPublication"][0]["content"];
      }
    });
  }
  displayGenre() {
    this.showGenres = true;
  }
  addToMedia(img) {
    if (!this.mediaAvailable.includes(img)) {
      this.mediaAvailable.push(img);
    }
    alert("Added");
  }

  removeMedia(img) {
    this.mediaAvailable = this.mediaAvailable.filter((el) => el != img);
    alert("Removed");
  }
  getSuggestedPublication() {
    this.service
      .get({ isPublished: false, publicationStatus: "2" })
      .subscribe((_response) => {
        let filterArr = _response.body.data;

        // remove display publication for suggested
        this.suggestedPublication = filterArr.filter((el) => el._id != this.id);
      });
  }
  getRecentWritingPublication() {
    this.service.getRecentWriting().subscribe((_response) => {
      let filterArr = _response.body.data;
      this.recentWriting = filterArr.filter(
        (el) => el.publicationId._id != this.id
      );
    });
  }
  getFollowing() {
    this.service.getFollowing().subscribe((_response) => {
      let filterArr = _response.body.data;
      this.following = filterArr.filter(
        (el) => el.publicationId._id != this.id
      );
      console.log(">>>", this.following);
    });
  }

  onSubmit(type?) {
    this.sAttributes.submitted = true;
    if (this.submissionForm.invalid) {
      return;
    }
    console.log('dsafs')
    let constData = this.submissionForm.value
    console.log(this.submissionForm.value)
    this.getContent(constData.content)
    const json = this.submissionForm.value;
    json["mediaAvailable"] = this.mediaAvailable;
    json["content"] = this.editorData;
    json["publicationId"] = this.id;
    json["publicationType"] = "writing";
    if (type) {
      json["isActive"] = true;
    }

    if (this.editAble) {
      this.service
        .updateUserPublishing(this.submissionId, json)
        .subscribe((_response) => {});
    } else {
      this.service.saveUserPublishing(json).subscribe((_response) => {
        let message = "Publish Content Saved";
        if (type) {
          message = "Publish Content Updated";
        }
        alert(message);
      });
    }
    this.getSuggestedPublication();
    this.sAttributes.submitted = false
    this.submissionForm.reset()
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, this.Modelconfig);
  }

  decline(): void {
    this.modalRef.hide();
  }

  updateBookmark(submissionId, type) {
    this.service
      .updateUserPublishing(submissionId, {
        publicationType: type === "add" ? "bookmark" : "",
      })
      .subscribe((_response) => {
        this.getPublication(this.id);
      });
  }

  publicationBookMarkStatus(publication) {
    return publication &&
      publication[0] &&
      publication[0].bookMarkStatus === "1"
      ? " fa-bookmark"
      : "fa-bookmark-o";
  }

  savePublicationBookMark(publication) {
    this.service
      .postBookMark({
        bookMarkStatus: 1,
        publicationId: this.id,
      })
      .subscribe((_response) => {
        this.getPublication(this.id); //get single publication
      });
  }

  updatePublicationBookMark(publication) {
    this.service
      .putBookMark(publication[0]._id, {
        bookMarkStatus: publication[0].bookMarkStatus === "0" ? 1 : 0,
        publicationId: publication[0]._id,
      })
      .subscribe((_response) => {
        this.getPublication(this.id); //get single publication
      });
  }

  // publicationBookMarkStatus(publication) {
  //   return publication &&
  //     publication.bookmark &&
  //     publication.bookmark.bookMarkStatus === "1"
  //     ? " fa-bookmark"
  //     : "fa-bookmark-o";
  // }

  getBrief(brief) {
    return brief.substr(0, 100);
    //console.log(brief)
  }

  openShareModal(template: TemplateRef<any>, id) {
    this.copyBlogLink(id, "publication");
    this.modalRef = this.modalService.show(template);
  }

  copyBlogLink(id, type?) {
    if (type == "publication") {
      this.copiedLink = "http://demo.writeawayy.com/publication/" + id;
    } else {
      this.copiedLink = "http://demo.writeawayy.com/blogs/" + id;
    }
  }

  kickInfo(type) {
    if (type === "starter") {
      this.kickStartInfo = this.data["kickstarter"];
    } else {
      this.kickStartInfo = this.data["kickbookDesc"];
    }
  }
}
