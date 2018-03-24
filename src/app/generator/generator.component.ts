import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TwitterService } from '../shared/services/twitter.service';

@Component({
    selector: 'app-generator',
    templateUrl: './generator.component.html',
    styleUrls: ['./generator.component.css']
})
export class GeneratorComponent implements OnInit {

    N: number; // Value of N to use in N-gram generation
    M: number; // # of tweets to generate

    imgURLs: string[];
    generated_tweets: string[];

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
        
        let user_tweets = [];
        let promises = [];
        this.imgURLs = [];
        users.forEach(user => {
            let args = user.split(`-`);
            this.twitter.getUserProfilePicURL(args[0]).then(res => {
                if(res !== null)
                    this.imgURLs.push(res);
            })
            promises.push(this.twitter.getUserTweets(args[0], parseInt(args[1])).then(res => {
                if(res !== null)
                    user_tweets = user_tweets.concat(res);
            }));
        });
        Promise.all(promises).then(() => {
            console.log(user_tweets.length)
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
        let P = {};
        Object.keys(n1grams).forEach(n1gram => {
            P[n1gram] = {};
            tokens.forEach(token => {
                let ngram = n1gram + " " + token;
                if(ngram in ngrams){
                    P[n1gram][token] = ngrams[ngram] / n1grams[n1gram];
                }
            });
        });
        console.log(P)
        this._generateTweets(P, tokens);
    }

    _generateTweets(P: {}, tokens: string[]){
        this.generated_tweets = [];
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
        }
    }

    getRandInt(max: number){
        return Math.floor(Math.random()*max);
    }
}