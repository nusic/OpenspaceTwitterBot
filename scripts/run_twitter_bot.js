var fs = require('fs');
var exec = require('child_process').exec;

var config = require('./config.js');

var nowStr = new Date().toISOString().replace(/[:\.]/g, '_');
var imageName = 'img_' + nowStr;
var captureCmd = 'node take_photo.js ' + imageName;

run();

function run(){
	exec(captureCmd, function(error, stdout, stderr){
		if(error) return console.error(error);
		if(stderr) console.error(stderr);
		if(stdout) console.log(stdout);

		var fileName = imageName + '.' + config.image.format;
		var pathToMedia = config.image.directory + '/' + fileName;

		onImageCaptured(pathToMedia);
	});
}

function onImageCaptured(pathToMedia){
	console.log(pathToMedia);

	var getTextCmd = 'node get_tweet_text.js %GITHUB_ACCESS_TOKEN%';
	exec(getTextCmd, function(error, stdout, stderr){
		if(error) return console.error(error);
		if(stderr) return console.error(stderr);
		if(stdout) {
			var tweetText = stdout;
			console.log('tweetText: ' + tweetText);

			onMediaAndTweetText(pathToMedia, tweetText);
		}
	});
}

function onMediaAndTweetText(pathToMedia, tweetText){
	var tweetCmd = 'node tweet_image_w_text.js';
	tweetCmd += ' ' + pathToMedia; // first argument 
	tweetCmd += ' "' + tweetText + '"'; // second argument
	
	exec(tweetCmd, function(error, stdout, stderr){
		if(error) return console.error(error);
		if(stderr) console.error(stderr);
		if(stdout) console.log(stdout);
	});
}
