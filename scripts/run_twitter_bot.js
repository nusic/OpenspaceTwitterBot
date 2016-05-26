var fs = require('fs');
var exec = require('child_process').exec;

var config = require('./config.js');

var nowStr = new Date().toISOString().replace(/[:\.]/g, '_');
var imageName = 'img_' + nowStr;
var imageCaptureScriptPath = config.rootPath + 'scripts/image_capture.js';
var captureCmd = 'node ' + imageCaptureScriptPath + ' ' + imageName;

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

	var getTweetScriptPath = config.rootPath + 'scripts/get_tweet_text.js';
	var getTextCmd = 'node ' + getTweetScriptPath + ' ' + config.github.credentials.token;
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
	var tweetScriptPath = config.rootPath + 'scripts/tweet_image_w_text.js';
	var tweetCmd = 'node ' + tweetScriptPath;
	tweetCmd += ' ' + pathToMedia; // first argument 
	tweetCmd += ' "' + tweetText + '"'; // second argument
	
	exec(tweetCmd, function(error, stdout, stderr){
		if(error) return console.error(error);
		if(stderr) console.error(stderr);
		if(stdout) console.log(stdout);
	});
}
