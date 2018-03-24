import { Component, OnInit } from '@angular/core';
import { TwitterService } from '../shared/services/twitter.service';
import { Observable } from 'rxjs/Observable';
import * as Rx from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  imgURL: string;
  input: string;
  inputChanged: boolean;

  constructor(private twitter: TwitterService) { }

  ngOnInit() {
    this.input = "";
    this.imgURL = null;
    this.inputChanged = false;

    Rx.Observable.timer(0, 1500).subscribe(() => {
      if(this.inputChanged){
        this.twitter.getUserProfilePicURL(this.input).then((res) => {
          this.imgURL = res;
        });
        this.inputChanged = false;
      }
    });
  }

  onInput(event: any){
    let screenNameChars = /[A-Za-z0-9_]|(Backspace)/;
    if(!screenNameChars.test(event.key)){
      event.preventDefault();
      return false;
    }

    let user: string = event.target.value;
    if(event.key === 'Backspace'){
      console.log("A"+user)
      user = user.substring(0, user.length-1);
      console.log("A"+user)
    }
    else{
      user += event.key;
    }
    this.inputChanged = true;
  }

  submit(){
    
  }
}
