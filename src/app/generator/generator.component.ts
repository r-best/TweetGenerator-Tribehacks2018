import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TwitterService } from '../shared/services/twitter.service';

@Component({
  selector: 'app-generator',
  templateUrl: './generator.component.html',
  styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

  tweets: string[];

  constructor(private route: ActivatedRoute, private twitter: TwitterService) { }

  ngOnInit() {
    let users = this.route.snapshot.queryParams.user;
    console.log(users)
    if(!Array.isArray(users))
      users = [users];
    console.log(users)
    
    this.tweets = [];
    let promises = [];
    console.log(users.length)
    users.forEach(user => {
      promises.push(this.twitter.getUserTweets(user).then(res => {
        if(res !== null)
          this.tweets.concat(res);
      }));
    });
    Promise.all(promises).then(() => {
      this._generateTweets()
    });
  }

  _generateTweets(){
    console.log("Starting")
    let ngrams: {};
    let n1grams: {};
    let tokens: string[];
    this.tweets.forEach(tweet => {
      tweet = tweet.replace(/[\(\)\$\.\!\?,'`\"%&:;]/, " $1 ");
      let words = tweet.split(/\s+/);
    });
  }
}