import { Injectable } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Router } from "@angular/router";
import { environment } from "src/environments/environment";
import { BaseService } from "../base.service";
import { Observable } from "rxjs";
import { map, catchError } from "rxjs/operators";


@Injectable({
  providedIn: 'root'
})
//export class BlogService extends BaseService {
export class ReaderService extends BaseService{

  constructor(public http: HttpClient, public router: Router) {
    super(environment.baseUrl + environment.apis.publications, http, router);
  }

  private readerBaseUrl: string = environment.baseUrl + 'reader' 
  


/**
   * This function is used to get all notification List.
   */
  saveReaderBookMark(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/save-bookmark', qObj);
  }

  /**
   * This function is used to get all notification List.
   */
  saveReaderLike(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/save-like', qObj);
  }

      /**
   * This function is used to get all notification List.
   */
  updateReaderLike(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-like', qObj);
  }

        /**
   * This function is used to get all notification List.
   */
  updateReaderBookMark(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-bookmark', qObj);
  }

    /**
   * This function is used to get all notification List.
   */
  updateReadCount(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-read-count', qObj);
  }

  saveReaderRating(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/save-reader-rating', qObj);
  }

  updateReaderRating(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-reader-rating', qObj);
  }







  /**
   * This function is used to get all notification List.
   */
  saveUserpublicationBookMark(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/save-userpublication-bookmark', qObj);
  }

  /**
   * This function is used to get all notification List.
   */
  saveUserpublicationLike(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/save-userpublication-like', qObj);
  }

      /**
   * This function is used to get all notification List.
   */
  updateUserpublicationLike(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-userpublication-like', qObj);
  }

        /**
   * This function is used to get all notification List.
   */
  updateUserpublicationBookMark(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-userpublication-bookmark', qObj);
  }

    /**
   * This function is used to get all notification List.
   */
  updateUserpublicationCount(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-userpublication-read-count', qObj);
  }

  saveUserpublicationRating(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/save-userpublication-rating', qObj);
  }

  updateUserpublicationRating(qObj: any): Observable<any> {
    return this.http.get<any[]>(this.readerBaseUrl + '/update-userpublication-rating', qObj);
  }




}
