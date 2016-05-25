var rootPath = 'C:/Users/Erik/Documents/Code/OpenspaceTwitterBot/';

module.exports = {
	rootPath: rootPath,
	camera: {
		name: 'Logitech HD Pro Webcam C920',
		runtime: '1',
		sound: {
			file: rootPath + 'data/sounds/CameraSound.m4a'
		}
	},
	image: {
		resolution: '1280x720',
		directory: rootPath + 'data/captures',
		format: 'jpeg',
	},
	vlcPath: 'C:/Program Files (x86)/VideoLAN/VLC/vlc.exe',
	github: {
		user: 'OpenSpace',
		repo: 'OpenSpace-Development',
		branch: 'feature/globebrowsing',
		allowOldCommits: false,
	},
}
