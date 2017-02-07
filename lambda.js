const requestPromise = require('request-promise'),
	  url = require('url'),
	  config = require('./config.json'),
	  semver = require('semver');

class UpdatesLambda {
	getResource(event, context, callback) {
		this._getLatestReleaseForChannel(event.pathParameters.channel)
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

	getLatest(event, context, callback) {
		this._getLatestReleaseForChannel(event.pathParameters.channel)
			.then(latestRelease => {
				if(semver.lt(clientVersion, latestRelease, true)) {
					context.succeed({
						statusCode: 200,
						body: {
							"url": url.resolve(config.packagesLocation, `${latestRelease}/mac/Fusion-${latestRelease}-mac.zip`)
						}
					});
				} else {
					context.succeed({
						statusCode: 204,
						body: {
						}
					});
				}
			});
	}

	_getLatestReleaseForChannel() {
		//TODO: missing channel exception
		var channelLocation = url.resolve(config.location, `channel/${channel}.release`);
    	return  requestPromise.get(channelLocation);
	}
}

module.exports = new UpdatesLambda();