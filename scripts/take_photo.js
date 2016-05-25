var exec = require('child_process').exec;
var config = require('./config.js');

var isWin = /^win/.test(process.platform);


if(process.argv.length === 3){
	var outFile = process.argv[2];
	run(outFile);
}
else{
	console.error('Invalid number of arguments: ' + process.argv.length-2);
	console.error('must provide exactly 1 argument: <outFile>');
}


function run(outFile){
	var cmd = takePhotoCommand(config, outFile);
	exec(cmd, function(error, stdout, stderr){
		if(error) throw new Error(error);
		if(stderr) return console.error(stderr);
		if(stdout) return console.log(stdout);
	});
}

function addWindowsParam(cmd, key, value){
	cmd += ' --' + key
	if(value !== undefined){
		cmd += '="' + value + '"';
	}
	return cmd;
}

function addUnixParam(cmd, key, value){
	cmd += ' --' + key
	if(value !== undefined){
		cmd += ' "' + value + '"';
	}
	return cmd;
}

// example command
// "C:/Program Files (x86)/VideoLAN/VLC/vlc.exe" --dshow-vdev="Logitech HD Pro Webcam C920" --dshow-size="1280x720" --vout="dummy" --intf="dummy" --dummy-quiet --video-filter="scene" --no-audio --scene-path="C:/Users/Erik/Documents/webcamd" --scene-format="jpeg" --scene-prefix="img" --scene-replace --run-time="1" --scene-ratio="24" "dshow://" vlc://quit
function takePhotoCommand(config, outFile){
	var addParam;
	if(isWin) addParam = addWindowsParam;
	else addParam = addUnixParam;

	var cmd = '"' + config.vlcPath + '"';

	cmd = addParam(cmd, 'dshow-vdev', config.camera.name);
	cmd = addParam(cmd, 'dshow-size', config.image.resolution);
	cmd = addParam(cmd, 'vout', 'dummy');
	cmd = addParam(cmd, 'intf', 'dummy');
	cmd = addParam(cmd, 'dummy-quiet');
	cmd = addParam(cmd, 'video-filter','scene');
	cmd = addParam(cmd, 'no-audio');
	cmd = addParam(cmd, 'scene-path', config.image.directory);
	cmd = addParam(cmd, 'scene-format', config.image.format);
	cmd = addParam(cmd, 'scene-prefix', outFile);
	cmd = addParam(cmd, 'scene-replace');
	cmd = addParam(cmd, 'run-time', config.camera.runtime);
	cmd = addParam(cmd, 'scene-ratio', '24');

	cmd += ' "dshow://" vlc://quit';

	return cmd;
}
