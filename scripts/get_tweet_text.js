var request = require('request');
var fs = require('fs');

var config = require('./config.js');



var INACTIVITY_TWEETS = config.rootPath + '/data/inactivity_tweets.txt';
var INACTIVITY_WEEKEND_TWEETS = config.rootPath + '/data/inactivity_weekend_tweets.txt';
var URL = 'https://api.github.com/repos'
	+ '/' + config.github.user 
	+ '/' + config.github.repo
	+ '/commits'
	+ '?sha=' + config.github.branch
	+ '&since=' + getSinceDate()
	+ 'access_token=' + config.github.credentials.token;

run();

function run(){
	var requestData = {
		headers: {
			'User-Agent': 'OpenspaceDevsAMNHTwitter'
		},
		url: URL
	};
	request(requestData, responseHandler);
}

function responseHandler(err, response, body){
	if(err){
		return console.error(err);
	}
	if(response.statusCode !== 200) {
		return console.error('Bad status code: ' + response.statusCode);
	}

	var commits = JSON.parse(body);

	// Loop through commits and pick first that is not a merge
	var commitDate = new Date(commit.committer.date);
	var committer = commit.committer.name.split(' ')[0];

	if(isToday(commitDate) || config.github.allowOldCommits){
		console.log(getTweetText(committer, commit.message));
	}
	else{
		getDefaultTweetText(printOnSuccess);
	}
};

function printOnSuccess(err, data){
	if(err) return console.error(err);
	else console.log(data);
}

function getTweetText(committer, msg){
	var autoMsgTrigger = 'github.com:' + config.github.user + '/' + config.github.repo;
	if(msg.indexOf(autoMsgTrigger) !== -1){
		return 'Looks like ' + committer + ' just merged a branch into ' + config.github.branch;
	}
	return cutIfNecessary('Latest commit by ' + committer + ': ' + msg);
}

function cutIfNecessary(message){
	var maxLength = 140;
	var encodedMessage = encodeURIComponent(message.trim());
	var encodedMes = encodedMessage.substr(0, maxLength);
	var lastEscapePos = encodedMes.lastIndexOf('%');
	if(lastEscapePos > encodedMes.length - 4){
		encodedMes = encodedMes.substr(0, lastEscapePos);
	}
	var mes = decodeURIComponent(encodedMes);

	// If the encoded message was cut
	if(encodedMessage.length > encodedMes.length){
		mes = mes.substr(0, mes.length-4) + '...';
	}

	return mes;
}

function getSinceDate(){
	var d = new Date();
	var todayIso = d.getFullYear() 
		+ '-' + d.getMonth()
		+ '-' + d.getDate()
		+ 'T00:00:00Z';
	return todayIso;
}

function isToday(d){
	var todaysDate = new Date(); 
	return isSameDay(d, todaysDate);
}

function isSameDay(d1, d2){
	return d1.getFullYear() === d2.getFullYear()
		&& d1.getMonth() === d2.getMonth()
		&& d1.getDate() === d2.getDate();
}

function getDefaultTweetText(cb){
	var saturday = 5;
	var today = new Date();
	var tweetsFile = (today.getDay() < saturday) ? 
		INACTIVITY_TWEETS : INACTIVITY_WEEKEND_TWEETS;

	readFirstLineAndMoveLast(tweetsFile, function(err, tweet){
		if(err) return cb(err);
		var twee = cutIfNecessary(tweet);
		if(tweet.length > twee.length){
			console.error(tweet);
			throw new Error('Tweet is too long to be uploaded to twitter:', tweet);
		}
		cb(null, tweet);
	});
}

function readFirstLineAndMoveLast(filename, cb) {
	fs.readFile(filename, 'utf8', function(err, data){
		if(err) return cb(err);
		var lines = data.split('\n');
		do{
			var tweet = lines.shift(1).trim();
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
