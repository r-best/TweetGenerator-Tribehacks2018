import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class TwitterService {

  API_URL: string = `http://localhost:5000`;

  constructor(private http: Http) {
    
  }

  getUserProfilePicURL(screenname: string): Promise<string>{
    return this.http.get(`${this.API_URL}/icons/${screenname}`).toPromise()
    .then(
      res => {return (res.json() === "User not found." || res.json() === "User has been suspended.") ? null : res.json()},
      err => {console.log(err); return null}
    ).catch(err => {console.log(err); return null});
  }

  getUserTweets(screenname: string){
    return this.http.get(`${this.API_URL}/tweets/${screenname}`).toPromise()
    .then(
      res => {return res.json() === "Sorry, that page does not exist." ? null : res.json()},
      err => {console.log(err); return null}
    ).catch(err => {console.log(err); return null});
  }
}