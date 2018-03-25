import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TwitterService } from '../shared/services/twitter.service';

@Component({
    selector: 'app-generator',
    templateUrl: './generator.component.html',
    styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

    loaded: boolean;
    
    N: number; // Value of N to use in N-gram generation
    M: number; // # of tweets to generate

    userData: {}[];
    generated_tweets: string[];
    randomUsers: number[]; // Array of indexes to userData, for the display to use to put a random user on each generated tweet

    constructor(private route: ActivatedRoute, private twitter: TwitterService) { }

    ngOnInit() {
        this.loaded = false;
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
        
        let user_tweets = [];
        let promises = [];
        this.userData = [];
        users.forEach(user => {
            let args = user.split(`-`);
            this.twitter.getUserData(args[0]).then(res => {
                if(res !== null)
                    this.userData.push(res);
            })
            promises.push(this.twitter.getUserTweets(args[0], parseInt(args[1])).then(res => {
                if(res !== null)
                    user_tweets = user_tweets.concat(res);
            }));
            this.incrementProgressBarPercent(10)
        });
        Promise.all(promises).then(() => {
            this._buildModel(user_tweets)
        });
    }

    _buildModel(user_tweets){
        console.log("Starting")
        let ngrams = {};
        let n1grams = {};
        let tokens = [];
        user_tweets.forEach(tweet => {
            tweet = tweet.replace(/https?:\/\/.*\b/g, "");
            tweet = tweet.replace(/([\(\)\$\.\!\?,'`\"%&:;])/, " $1 ");
            tweet = tweet.trim();
            tweet = tweet.toLowerCase();
            let words = tweet.split(/[\s\n]+/);

            if(words.length < this.N)
                return;
            
            for(let n = 0; n < this.N-1; n++)
                words = ["<start>"].concat(words).concat(["<end>"]);
            
            // Construct N-gram and (N-1)-gram from each token and the tokens before it
            for(let i = this.N-2; i < words.length; i++){
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
                tokens.push(words[i]);
            }
        });

        //Calculate probabilities
        console.log("Calculating probabilites")
        let P = {};
        let completedCalculations = 0.0;
        let totalToCalculate = Object.keys(n1grams).length;
        let UPDATE_PROGRESS_INCR = 1.0;
        let lastProgressUpdate = 0.0;
        Object.keys(n1grams).forEach(n1gram => {
            P[n1gram] = {};
            tokens.forEach(token => {
                let ngram = n1gram + " " + token;
                if(ngram in ngrams){
                    P[n1gram][token] = ngrams[ngram] / n1grams[n1gram];
                }
            });
            completedCalculations++;
            let progress = completedCalculations / totalToCalculate * 100;
            if(progress > lastProgressUpdate + UPDATE_PROGRESS_INCR){
                lastProgressUpdate += UPDATE_PROGRESS_INCR;
                this.incrementProgressBarPercent(UPDATE_PROGRESS_INCR);
            }
        });
        console.log(P)
        this._generateTweets(P, tokens);
    }

    _generateTweets(P: {}, tokens: string[]){
        this.generated_tweets = [];
        this.randomUsers = [];
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
                
                for(let i = 0; i < tokens.length; i++){
                    if(!(lastN1Words in P) || !(tokens[i] in P[lastN1Words]) || P[lastN1Words][tokens[i]] === 0)
                        continue;
                    counter += P[lastN1Words][tokens[i]];
                    if(counter > rand){
                        tweet += " " + tokens[i];
                        break;
                    }
                };
            }
            tweet = tweet.replace(/\s*<start>\s*/, "");
            tweet = tweet.replace(/\s*<end>/, "");
            tweet = tweet.replace(/\s*'\s*/g, "");
            tweet = tweet.replace(/\s*([,\.\!\?\)])/g, "$1 ");
            tweet = tweet.replace(/([\(\$])\s*/g, "$1");
            tweet = tweet.replace(/\s*([\)])/g, "$1");
            tweet = tweet.replace(/^([a-z])/g, tweet.charAt(0).toUpperCase());
            this.generated_tweets.push(tweet);
            this.randomUsers.push(this.getRandInt(this.userData.length));
        }
        this.loaded = true;
        console.log(this.randomUsers)
    }

    getRandInt(max: number){
        return Math.floor(Math.random()*max);
    }

    incrementProgressBarPercent(percent: number){
        let x = document.getElementById("progress");
        if(x !== null){
            let y = parseInt(x.style.width.substring(0, x.style.width.length)) + percent;
            x.style.width = y + "%";
        }
    }
}