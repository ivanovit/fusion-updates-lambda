var requestPromise = require('request-promise'),
	url = require('url'),
	semver = require('semver'),
	config = { 
		packagesLocation: 'http://dy0uugugdpwse.cloudfront.net/ab/fusion/' 
	};

function getLatestReleaseForChannel(channel) {
	return  requestPromise.get(url.resolve(config.packagesLocation, `channel/${channel}.release`));
}

exports.getResource = function(event, context, callback) {
	getLatestReleaseForChannel(event.pathParameters.channel)
	.then(latestRelease => {
		const redirectUrl = url.resolve(config.packagesLocation, `${latestRelease}/${event.pathParameters.platform}/${event.pathParameters.file}`);

		context.succeed({
			statusCode: 302,
			headers: {
				'Location': redirectUrl
			},
			body: `Found. Redirecting to ${redirectUrl}`
		});
	});
}

exports.getLatest = function(event, context, callback) {
	getLatestReleaseForChannel(event.pathParameters.channel)
	.then(latestRelease => {
		if(semver.lt(event.queryStringParameters.clientVersion, latestRelease, true)) {
			context.succeed({
				statusCode: 200,
				headers: {},
				body: JSON.stringify({
					'url': url.resolve(config.packagesLocation, `${latestRelease}/mac/Fusion-${latestRelease}-mac.zip`)
				})
			});
		} else {
			context.succeed({
				statusCode: 204,
				body: ''
			});
		}
	});
}