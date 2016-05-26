var exec = require('child_process').exec;
var config = require('./config.js');

var isWin = /^win/.test(process.platform);

if(process.argv.length === 3){
	var outFile = process.argv[2];
	run(outFile);
}
else{
	console.error('Invalid number of arguments: ' + (process.argv.length-2));
	console.error('must provide exactly 1 argument: <outFile>');
}


function run(outFile){
	var playSoundCmd = soundCommand(config);
	exec(playSoundCmd);

	var imageCaptureCmd = imageCaptureCommand(config, outFile);
	setTimeout(function(){
		exec(imageCaptureCmd, function(error, stdout, stderr){
			if(error) throw new Error(error);
			if(stderr) return console.error(stderr);
			if(stdout) return console.log(stdout);
		});
	}, config.camera.delay);
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

function soundCommand(config){
	var addParam;
	if(isWin) addParam = addWindowsParam;
	else addParam = addUnixParam;

	var soundCmd = '"' + config.vlcPath + '"';
	soundCmd = addParam(soundCmd, 'vout', 'dummy');
	soundCmd = addParam(soundCmd, 'intf', 'dummy');
	soundCmd += ' "' + config.camera.sound.file.replace(/\//g, '\\') + '"';
	soundCmd += ' vlc://quit \n';
	return soundCmd;
}

// example command
// "C:/Program Files (x86)/VideoLAN/VLC/vlc.exe" --dshow-vdev="Logitech HD Pro Webcam C920" --dshow-size="1280x720" --vout="dummy" --intf="dummy" --dummy-quiet --video-filter="scene" --no-audio --scene-path="C:/Users/Erik/Documents/webcamd" --scene-format="jpeg" --scene-prefix="img" --scene-replace --run-time="1" --scene-ratio="24" "dshow://" vlc://quit
function imageCaptureCommand(config, outFile){
	var addParam;
	if(isWin) addParam = addWindowsParam;
	else addParam = addUnixParam;

	var captureCmd = '"' + config.vlcPath + '"';

	captureCmd = addParam(captureCmd, 'dshow-vdev', config.camera.name);
	captureCmd = addParam(captureCmd, 'dshow-size', config.image.resolution);
	captureCmd = addParam(captureCmd, 'vout', 'dummy');
	captureCmd = addParam(captureCmd, 'intf', 'dummy');
	captureCmd = addParam(captureCmd, 'dummy-quiet');
	captureCmd = addParam(captureCmd, 'video-filter','scene');
	captureCmd = addParam(captureCmd, 'no-audio');
	captureCmd = addParam(captureCmd, 'scene-path', config.image.directory);
	captureCmd = addParam(captureCmd, 'scene-format', config.image.format);
	captureCmd = addParam(captureCmd, 'scene-prefix', outFile);
	captureCmd = addParam(captureCmd, 'scene-replace');
	captureCmd = addParam(captureCmd, 'run-time', config.camera.runtime);
	captureCmd = addParam(captureCmd, 'scene-ratio', '24');

	captureCmd += ' "dshow://" vlc://quit';

	return captureCmd;
}
