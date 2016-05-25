var exec = require('child_process').exec;

var config = require('./config.js');

var verbose = true;

if(process.argv.length === 4){
	var imgPath = process.argv[2];
	var text = process.argv[3];
	run(imgPath, text);
}
else{
	console.log('Invalid number of argument:', process.argv.length-2);
	console.log('Run with exactly two arguments: <path to media> <tweet text>');
}

function run(imgPath, text){
	var upload;
	//upload = uploadImageTwurl
	upload = uploadImageRaw;

	upload(imgPath, function(err, mediaId){
		if(err) return console.error(err);
		else {
			tweetWithMedia(mediaId, text);
		}
	});
}

function uploadImageRaw(imgPath, cb){

	var upLoadScriptPath = config.rootPath + 'scripts/twitter_upload.js';
	var uploadImageCommand = 'node ' + upLoadScriptPath + ' image/jpg ' + imgPath;
	console.log('executing command: ' + uploadImageCommand);

	exec(uploadImageCommand, function(error, stdout, stderr) { 
		if(error) return cb(error);
		if(stderr) return cb(stderr);

		var uploadResponse = JSON.parse(stdout.split('\n')[1]);
		if(uploadResponse.error){
			throw new Error(uploadResponse.error);
		}

		if(verbose) console.log(uploadResponse);
		var mediaId = uploadResponse.media_id_string;

		cb(null, mediaId);
	});
}


function uploadImageTwurl(imgPath, cb){
	var uploadImageCommand = 'twurl -H upload.twitter.com "/1.1/media/upload.json" -f ' + imgPath + ' -F media -X POST'
	console.log('executing command: ' + uploadImageCommand);

	exec(uploadImageCommand, function(error, stdout, stderr) { 
		if(error) return cb(error);
		if(stderr) return cb(stderr);

		var uploadResponse = JSON.parse(stdout);
		if(uploadResponse.error){
			throw new Error(uploadResponse.error);
		}

		if(verbose) console.log(uploadResponse);
		var mediaId = uploadResponse.media_id_string;

		cb(null, mediaId);
	});
}

function tweetWithMedia(mediaId){
	var tweetCommand = 'twurl "/1.1/statuses/update.json" -d "media_ids=' + mediaId + '&status=' + text + '"';
	console.log('executing command: ' + tweetCommand);

	exec(tweetCommand, function(error, stdout, stderr) { 
		if(error) return console.error(error);
		if(stderr) return console.error(stderr);

		var tweetResponse = JSON.parse(stdout);
		console.log('Uploaded text and media link: ' + tweetResponse.text);
	});
}

