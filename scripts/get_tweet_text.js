var request = require('request');
var fs = require('fs');

var inactiveTweetsFile = '../data/inactivity_tweets.txt';
var inactiveWeekendTweetsFile = '../data/inactivity_weekend_tweets.txt';

var oldCommitIsAllowed = true;

var BASE_URL = 'https://api.github.com/repos/OpenSpace/OpenSpace-Development/commits/feature/globebrowsing';
var requestUrl = BASE_URL + '?access_token=' + process.argv[2];

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
		url: requestUrl
	};
	//request(requestData, responseHandler);
	printFirstLineAndMoveLast(inactiveTweetsFile);

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

	if(isSameDay(commitDate, todaysDate) || oldCommitIsAllowed){
		console.log('Latest commit by ' + committer + ': ' + commit.message);
	}
	else{
		var saturday = 5;
		var tweetsFile = (todaysDate.getDay() < saturday) ? 
			inactiveTweetsFile : inactiveWeekendTweetsFile;

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
