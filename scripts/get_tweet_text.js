var request = require('request');
var fs = require('fs');
var async = require('async');

var config = require('./config.js');

var INACTIVITY_TWEETS = config.rootPath + '/data/inactivity_tweets.txt';
var INACTIVITY_WEEKEND_TWEETS = config.rootPath + '/data/inactivity_weekend_tweets.txt';

run();

function run(){
	var githubUrls = getURLs();

	getCommits(githubUrls, function(err, commits){
		if(err) return console.error(err);

		var commit = getMostInterestingCommit(commits);
		printTweetText(commit);
	});
}

function getURLs(){
	if(!Array.isArray(config.github.branch)){
		config.github.branch = [config.github.branch];
	}

	var urls = [];
	for (var i = 0; i < config.github.branch.length; i++) {
		var url = 'https://api.github.com/repos'
			+ '/' + config.github.user 
			+ '/' + config.github.repo
			+ '/commits'
			+ '?sha=' + config.github.branch[i]
			+ '&since=' + getSinceDate()
			+ '&access_token=' + config.github.credentials.token;

		urls.push(url);
	}
	return urls;
}

function getCommits(githubUrls, getCommitsCallback){
	function getBranchCommits(url, callback){
		var headers = { 'User-Agent': 'OpenspaceDevsAMNHTwitter' };
		request({headers, url}, function(err, response, body){
			if(err) return callback(err); 
			if(response.statusCode !== 200) return callback('Bad status code: ' + response.statusCode);
			var commits = JSON.parse(body);
			callback(null, commits);
		});
	}

	async.map(githubUrls, getBranchCommits, function(err, branchCommits){
		if(err) return getCommitsCallback(err);

		var commits = [];
		for (var i = 0; i < branchCommits.length; i++) {
			commits = commits.concat(branchCommits[i]);
		}
		getCommitsCallback(null, commits);
	});
}

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

function printTweetText(commit){
	if(commit !== null){
		var committer = commit.committer.name.split(' ')[0];
		var autoMessageTrigger = 'github.com:' + config.github.user + '/' + config.github.repo;
		if(commit.message.indexOf(autoMessageTrigger) !== -1){
			return 'Looks like ' + committer + ' just merged a branch into ' + config.github.branch;
		}
		var tweetText = cutIfNecessary(committer + ' commited: ' + commit.message);
		console.log(tweetText);
	}
	else {
		getDefaultTweetText(printOnSuccess);
	}
}

function getScore(msg){
	var score = 0;
	var autoMessageTrigger = 'github.com:' + config.github.user + '/' + config.github.repo;
	if(msg.indexOf(autoMessageTrigger) === -1){
		score += 1;
	}
	score += (1 / 140) * msg.length;
	return score;
}

function getTodayDateStr(){
	var d = new Date();
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);
	return d.toISOString();
}



function getSinceDate(){
	var d = new Date();
	d.setHours(0);
	d.setMinutes(0);
	d.setSeconds(0);
	d.setMilliseconds(0);

	switch(config.github.since.toLowerCase()){
		case 'today': 
			return d.toISOString();
		case 'yesterday': 
			d.setDate(d.getDate() - 1); 
			return d.toISOString();
		case 'debug':
			d.setHours(d.getHours() - 17);
			return d.toISOString();
	}
	throw new Error('Invalid value: ' + config.github.since);
}

function cutIfNecessary(message){
	var maxLength = 140;
	var encodedMessage = encodeURIComponent(message.trim());
	var encodedMes = encodedMessage.substr(0, maxLength);
	var lastEscapePos = encodedMes.lastIndexOf('%');
	if(lastEscapePos > encodedMes.length - 3){
		encodedMes = encodedMes.substr(0, lastEscapePos);
	}
	var mes = decodeURIComponent(encodedMes);

	// If the encoded message was cut
	if(encodedMessage.length > encodedMes.length){
		mes = mes.substr(0, mes.length-3) + '...';
	}

	return mes;
}

function getDefaultTweetText(cb){
	var tweetsFile = todayIsWeekend() ? INACTIVITY_WEEKEND_TWEETS : INACTIVITY_TWEETS;

	var tweet = readFirstLineAndMoveLast(tweetsFile, function(err, tweet){
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
		do {
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
