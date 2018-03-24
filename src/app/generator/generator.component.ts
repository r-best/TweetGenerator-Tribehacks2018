import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TwitterService } from '../shared/services/twitter.service';

@Component({
    selector: 'app-generator',
    templateUrl: './generator.component.html',
    styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

    user_tweets: string[];
    N: number;
    M: number;

    P: {};
    tokens: string[];

    constructor(private route: ActivatedRoute, private twitter: TwitterService) { }

    ngOnInit() {
        this.N = this.route.snapshot.queryParams.N;
        this.M = this.route.snapshot.queryParams.M;
        let users = this.route.snapshot.queryParams.user;
        if(this.N === undefined)
            this.N = 2;
        if(this.M === undefined)
            this.M = 100;
        if(users === undefined){
            //bad things happen
        }

        if(!Array.isArray(users))
            users = [users];
        
        this.user_tweets = [];
        let promises = [];
        users.forEach(user => {
            promises.push(this.twitter.getUserTweets(user).then(res => {
                if(res !== null)
                    this.user_tweets = this.user_tweets.concat(res);
            }));
        });
        Promise.all(promises).then(() => {
            console.log(this.user_tweets)
            this._buildModel()
        });
    }

    _buildModel(){
        console.log("Starting")
        let ngrams = {};
        let n1grams = {};
        this.tokens = [];
        this.user_tweets.forEach(tweet => {
            tweet = tweet.replace(/https?:\/\/.*\b/g, "");
            tweet = tweet.replace(/([\(\)\$\.\!\?,'`\"%&:;])/, " $1 ");
            tweet = tweet.trim();
            let words = tweet.split(/[\s\n]+/);

            if(words.length < this.N)
                return;
            
            for(let n = 0; n < this.N-1; n++)
                words = ["<start>"].concat(words).concat(["<end>"]);
            
            // Construct N-gram and (N-1)-gram from each token and the tokens before it
            for(let i = this.N-2; i < words.length; i++){
                console.log(words[i])
                // Construct (N-1)-gram from each word and the N-2 tokens behind it
                let n1gramTokens = [];
                for(let n = 0; n < this.N-1; n++)
                    n1gramTokens = [words[i-n]].concat(n1gramTokens);
                let n1gram = n1gramTokens.join(" ");
                // Increment its frequency
                if(!(n1gram in n1grams))
                    n1grams[n1gram] = 0;
                n1grams[n1gram]++;
                // Construct N-gram by adding next token to (N-1)-gram
                let ngram = words[i-this.N+1] + " " + n1gram;
                // Increment its frequency
                if(!(ngram in ngrams))
                    ngrams[ngram] = 0;
                ngrams[ngram]++;
                // Add this token to the tokens array
                this.tokens.push(words[i]);
            }
        });

        //Calculate probabilities
        this.P = {};
        Object.keys(n1grams).forEach(n1gram => {
            this.P[n1gram] = {};
            this.tokens.forEach(token => {
                let ngram = n1gram + " " + token;
                if(ngram in ngrams){
                    this.P[n1gram][token] = ngrams[ngram] / n1grams[n1gram];
                }
            });
        });
        console.log(this.P)
        this._generateTweets();
    }

    _generateTweets(){
        let generated = [];
        for(let m = 0; m < this.M; m++){
            let tweet = "";
            for(let n = 0; n < this.N-1; n++){
                tweet = tweet + "<start>";
                if(n < this.N-2)
                    tweet = tweet + " ";
            }

            while(!tweet.includes("<end>")){
                let rand = Math.random();
                let counter = 0;

                let temp = tweet.split(" ");
                let lastN1Words = temp.pop();
                for(let n = 0; n < this.N-2; n++)
                    lastN1Words = temp.pop() + " " + lastN1Words;
                
                for(let i = 0; i < this.tokens.length; i++){
                    if(!(lastN1Words in this.P) || !(this.tokens[i] in this.P[lastN1Words]) || this.P[lastN1Words][this.tokens[i]] === 0)
                        continue;
                    counter += this.P[lastN1Words][this.tokens[i]];
                    if(counter > rand){
                        tweet += " " + this.tokens[i];
                        break;
                    }
                };
            }
            tweet = tweet.replace(/\s*<start>\s*/, "");
            tweet = tweet.replace(/\s*<end>/, "");
            tweet = tweet.replace(/\s*'\s*/g, "");
            tweet = tweet.replace(/\s*([,\.\!\?\)])/g, "$1");
            tweet = tweet.replace(/([\(\$])\s*/g, "$1");
            tweet = tweet.replace(/\s*([\)])/g, "$1");
            tweet = tweet.replace(/^([a-z])/g, tweet.charAt(0).toUpperCase());
            console.log(tweet)
        }
    }
}