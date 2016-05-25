var exec = require('child_process').exec;

var verbose = true;
var imgPath, text;

if(process.argv.length === 4){
	imgPath = process.argv[2];
	text = process.argv[3];
	run();
}
else{
	console.log('Invalid number of argument:', process.argv.length-2);
	console.log('Run with exactly two arguments: <path to media> <tweet text>');
}

function run(){
	var uploadImageCommand = 'twurl -H upload.twitter.com "/1.1/media/upload.json" -f ' + imgPath + ' -F media -X POST'
	console.log('executing command: ' + uploadImageCommand);

	exec(uploadImageCommand, function(error, stdout, stderr) { 
		if(error) return console.error(error);
		if(stderr) return console.error(stderr);

		var uploadResponse = JSON.parse(stdout);
		if(uploadResponse.error){
			throw new Error(uploadResponse.error);
		}

		if(verbose) console.log(uploadResponse);
		var mediaId = uploadResponse.media_id_string;

		tweetWithMedia(mediaId);
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

