import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';
import { spawn } from 'child_process';

@Injectable()
export class TwitterService {

  API_URL: string = `http://localhost:5000`;

  constructor(private http: Http) {
    
  }

  getUserProfilePicURL(screenname: string): Promise<string>{
    return this.http.get(`${this.API_URL}/icons/${screenname}`).toPromise()
    .then(
      res => {return (res.json() === "User not found." || res.json() === "User has been suspended.") ? null : res.json()},
      err => {console.log(err)}
    ).catch(err => console.log(err));
  }

  getUserTweets(screenname: string){
    return this.http.get(`${this.API_URL}/tweets/${screenname}`).toPromise()
    .then(
      res => {console.log(res.json())},
      err => {console.log(err)}
    ).catch(err => console.log(err));
  }
}