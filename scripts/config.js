var rootPath = 'C:/Users/Erik/Documents/Code/OpenspaceTwitterBot/';

module.exports = {
	rootPath: rootPath,
	camera: {
		name: 'Logitech HD Pro Webcam C920',
		runtime: '1',
		sound: {
			file: rootPath + 'data/sounds/CameraSound.m4a'
		},
		delay: 1000,
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
		credentials: {
			token: process.env.GITHUB_ACCESS_TOKEN,
		}
	},
	twitter: {
		credentials: {
			consumer_key: process.env.TWITTER_CONSUMER_KEY,
			consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
			token: process.env.TWITTER_ACCESS_TOKEN,
			token_secret: process.env.TWITTER_ACCESS_TOKEN_SECRET
		},
	}
}
