import { Injectable } from '@angular/core';
import { Http, Headers } from '@angular/http';

@Injectable()
export class TwitterService {

  API_URL: string = `http://localhost:5000`;

  constructor(private http: Http) {
    
  }

  getUserData(screenname: string): Promise<{}>{
    return this.http.get(`${this.API_URL}/users/${screenname}`).toPromise()
    .then(
      res => {
        console.log(res)
        return (res.json() === "User not found." || res.json() === "User has been suspended.") ? {} : res.json()
      },
      err => {console.log(err); return {}}
    ).catch(err => {console.log(err); return {}});
  }

  getUserTweets(screenname: string, count: number){
    return this.http.get(`${this.API_URL}/tweets/${screenname}?pages=${count}`).toPromise()
    .then(
      res => {return res.json() === "Sorry, that page does not exist." ? null : res.json()},
      err => {console.log(err); return null}
    ).catch(err => {console.log(err); return null});
  }
}