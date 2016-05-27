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
	+ '&access_token=' + config.github.credentials.token;

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
	if(err) return console.error(err); 
	if(response.statusCode !== 200) return console.error('Bad status code: ' + response.statusCode);

	var commitOverviews = JSON.parse(body);

	var commit = getMostInterestingCommit(commitOverviews);
	if(commit !== null){
		var committer = commit.committer.name.split(' ')[0];
		var tweetText = getTweetText(committer, commit.message)
		console.log(tweetText);
	}
	else {
		getDefaultTweetText(printOnSuccess);
	}
};

function getMostInterestingCommit(commitOverviews){
	var mostInterestingCommit = null;
	var bestScore = -Infinity;
	for (var i = 0; i < commitOverviews.length; i++) {
		var commit = commitOverviews[i].commit;
		var score = getScore(commit.message);
		if(bestScore < score){
			mostInterestingCommit = commit;
			bestScore = score;
		}
	}
	return mostInterestingCommit;
}


function printOnSuccess(err, data){
	if(err) return console.error(err);
	else console.log(data);
}

function getTweetText(committer, msg){
	var autoMsgTrigger = 'github.com:' + config.github.user + '/' + config.github.repo;
	if(msg.indexOf(autoMsgTrigger) !== -1){
		return 'Looks like ' + committer + ' just merged a branch into ' + config.github.branch;
	}
	return cutIfNecessary(committer + ' commited: ' + msg);
}

function getScore(msg){
	var score = 0;
	var autoMsgTrigger = 'github.com:' + config.github.user + '/' + config.github.repo;
	if(msg.indexOf(autoMsgTrigger) === -1){
		score += 1;
	}
	score += (1 / 140) * msg.length;
	return score;
}

function getSinceDate(){
	switch(config.github.since.toLowerCase()){
		case 'today':  
			return (new Date()).toISOString().substr(0, 10) + 'T00:00:00.000Z';
	}
	throw new Error('Invalid value: ' + config.github.since);
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

function getDefaultTweetText(cb){
	var tweetsFile = todayIsWeekend() ? INACTIVITY_WEEKEND_TWEETS : INACTIVITY_TWEETS;

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

function todayIsWeekend(){
	var todaysDay = (new Date()).getDay();
	return todaysDay === 0 || todaysDay === 6;
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
