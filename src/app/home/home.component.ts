import { Component, OnInit } from '@angular/core';
import { TwitterService } from '../shared/services/twitter.service';
import { Router } from '@angular/router';
import * as Rx from 'rxjs';
import { ToastService } from '../shared/services/toast.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  inputs: {}[];
  imgURLs: string[];
  inputsChanged: boolean[];

  constructor(private router: Router, private twitter: TwitterService, private toast: ToastService) { }

  ngOnInit() {
    this.inputs = [{text:"",count:200}];
    this.imgURLs = [null];
    this.inputsChanged = [false];

    Rx.Observable.timer(0, 1500).subscribe(() => {
      for(let i = 0; i < this.inputsChanged.length; i++){
        if(this.inputsChanged[i]){
          this.twitter.getUserData(this.inputs[i]['text']).then((res) => {
            console.log(res)
            // if(res === null)
            this.imgURLs[i] = res[`profile_image_url`];
          });
          this.inputsChanged[i] = false;
        }
      }
    });
  }

  onInput(event: any, index: number){
    let screenNameChars = /[A-Za-z0-9_]|(Backspace)/;
    if(!screenNameChars.test(event.key)){
      event.preventDefault();
      return false;
    }

    let user: string = event.target.value;
    if(event.key === 'Backspace'){
      user = user.substring(0, user.length-1);
    }
    else{
      user += event.key;
    }
    this.inputsChanged[index] = true;
  }

  addUser(){
    if(this.inputs.length < 5){
      this.inputs[this.inputs.length] = {text:"",count:200};
      this.imgURLs[this.imgURLs.length] = null;
      this.inputsChanged[this.inputsChanged.length] = false;
    }
  }

  removeUser(index: number){
    if(this.inputs.length > 1){
      this.inputs.splice(index, 1);
      this.imgURLs.splice(index, 1);
      this.inputsChanged.splice(index, 1);
    }
  }

  submit(){
    let promises = [];
    this.inputs.forEach(input => {
      promises.push(this.twitter.getUserData(input[`text`]).then((res) => {
        if(res !== null)
          return Promise.resolve();
        return Promise.reject(`Twitter user '${input[`text`]}' does not exist`);
      }));
    });
    Promise.all(promises).then(
      res => this.router.navigate([`/generator`], {queryParams: {user: this.inputs.map(item => item[`text`]+"-"+(parseInt(item[`count`])/200))}}),
      err => this.toast.showToast(`alert-danger`, err)
    );
  }

  trackByIndex(index: number, value: string) {
    return index;
  }
}
