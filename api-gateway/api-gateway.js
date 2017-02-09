var AWS = require('aws-sdk'),
    fs = require('fs');

class APIGatewayWrapper {
    constructor(region, logger) {
        AWS.config.update({region: region});
        this.apigateway = new AWS.APIGateway();
        this.logger = logger;
    }

    createDeployment(restApiId, stageName, callback) { 
        const params = {
            'restApiId': restApiId,
            'stageName': stageName,
            'variables': {
                'version': stageName
            }
        };

        this.logger.writeln(`Creating deployment for restApiId:${restApiId} stage:${stageName}`);
        return this.apigateway.createDeployment(params).promise();
    }

    putRestApi(restApiId, swaggerPath, callback) {
        const params = {
            'body': fs.readFileSync(swaggerPath),
            'restApiId': restApiId,
            'mode': 'overwrite'
        };
        
        this.logger.writeln(`Uploading api gateway from swagger for restApiId:${restApiId} swaggerPath:${swaggerPath}`);
        return this.apigateway.putRestApi(params).promise();
    }
}

module.exports = APIGatewayWrapper;