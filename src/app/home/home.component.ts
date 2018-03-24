import { Component, OnInit } from '@angular/core';
import { TwitterService } from '../shared/services/twitter.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  imgURL: string;

  constructor(private twitter: TwitterService) { }

  ngOnInit() {
    
  }

  checkUser(event: any){
    console.log(event.target.value)
    this.twitter.getUserProfilePicURL(event.target.value).then((res) => {
      if(res !== null)
        this.imgURL = res;
    })
  }
}
