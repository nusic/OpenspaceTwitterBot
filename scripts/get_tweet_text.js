var request = require('request');
var fs = require('fs');

var config = require('./config.js');

var INACTIVITY_TWEETS = config.rootPath + '/data/inactivity_tweets.txt';
var INACTIVITY_WEEKEND_TWEETS = config.rootPath + '/data/inactivity_weekend_tweets.txt';
var BASE_URL = 'https://api.github.com/repos'
	+ '/' + config.github.user 
	+ '/' + config.github.repo
	+ '/commits/' + config.github.branch;



if(process.argv.length === 3){
	run();
}
else{
	console.log('Must provide one argument: <github access token>');
}

function run(){
	var requestData = {
		headers: {
			'User-Agent': 'OpenspaceDevsAMNHTwitter'
		},
		url: (BASE_URL + '?access_token=' + process.argv[2])
	};
	request(requestData, responseHandler);
	//printFirstLineAndMoveLast(INACTIVITY_TWEETS);
}

function responseHandler(err, response, body){
	if(err){
		return console.error(err);
	}
	if(response.statusCode !== 200) {
		return console.error('Bad status code: ' + response.statusCode);
	}

	var resp = JSON.parse(body);
	var commit = resp.commit;
	var commitDate = new Date(commit.committer.date);
	var todaysDate = new Date();
	var committer = commit.committer.name.split(' ')[0];

	if(false && isSameDay(commitDate, todaysDate) || config.github.allowOldCommits){
		console.log('Latest commit by ' + committer + ': ' + commit.message);
	}
	else{
		var saturday = 5;
		var tweetsFile = (todaysDate.getDay() < saturday) ? 
			INACTIVITY_TWEETS : INACTIVITY_WEEKEND_TWEETS;

		printFirstLineAndMoveLast(tweetsFile);
	}
};	

function isToday(d){
	var todaysDate = new Date(); 
	return isSameDay(d, todaysDate);
}

function isSameDay(d1, d2){
	return d1.getFullYear() === d2.getFullYear()
		&& d1.getMonth() === d2.getMonth()
		&& d1.getDate() === d2.getDate();
}

function readFirstLineAndMoveLast(filename, cb) {
	fs.readFile(filename, 'utf8', function(err, data){
		if(err) return cb(err);
		var lines = data.split('\n');
		do{
			var tweet = lines.shift(1);
			lines.push(tweet);
		} while(tweet.trim().substr(0,2) === '//');

		fs.writeFile(filename, lines.join('\n'), function(err){
			return cb(err, tweet);
		});
	});
}

function printFirstLineAndMoveLast(filename){
	readFirstLineAndMoveLast(filename, function(err, tweet){
		if(err) return console.error(err);
		else console.log(tweet);
	});
}
