import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReadingRoomRoutingModule } from './reading-room-routing.module';
import { ReadingRoomSingleComponent } from './reading-room-single/reading-room-single.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CeiboShare } from 'ng2-social-share';
import { NgxStarRatingModule } from 'ngx-star-rating';



@NgModule({
  declarations: [ReadingRoomSingleComponent, CeiboShare],
  imports: [
    CommonModule,
    ReadingRoomRoutingModule,
    FormsModule,
    NgxStarRatingModule,
    ReactiveFormsModule

  ]
})
export class ReadingRoomModule { }
