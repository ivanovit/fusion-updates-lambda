var grunt = require('grunt'),
	path = require('path'),
	ApiGateway = require('./api-gateway/api-gateway'),
	stage = grunt.option('stage') || 'dev',
	region = grunt.option('region') || "eu-central-1",
	restApiId = grunt.option('restApiId'),
	accountId = grunt.option('accountId'),
	buildVersion = grunt.option('buildVersion') || "";

//if(!restApiId) { grunt.fail.warn(`Missing options restApiId`) }
//if(!accountId) { grunt.fail.warn(`Missing options accountId`) }

grunt.initConfig({
   lambda_deploy: {
	  getLatest: {
		arn: `arn:aws:lambda:${region}:${accountId}:function:getLatest`,
		 options: {
			region: region,
			handler: 'lambda.getLatest',
			aliases: stage,
            enableVersioning: true
		 },
		 package: '<%= lambda_deploy.all.package %>'
	  },
	  getResource: {
		 arn: `arn:aws:lambda:${region}:${accountId}:function:getResource`,
		 options: {
			region: region,
			handler: 'lambda.getResource',
			aliases: stage,
            enableVersioning: true
		 },
		 package: '<%= lambda_deploy.all.package %>'
	  }
   },
   lambda_package: {
		all: {
			options: {
				include_time: false
			}
		}
   },
   api_gateway_deploy: {
	   default: {
			swaggerPath: path.resolve('./dist/updates-api-swagger.json'),
			stage: stage,
			restApiId: restApiId
	   }
   },
   replace: {
      apiGatewaySwagger: {
        options: {
          patterns: [
            {
              match: 'region',
              replacement: region
            },
			{
              match: 'accountId',
              replacement: accountId
            },
          ]
        },
        files: [
          { expand: true, flatten: true, src: ['./api-gateway/updates-api-swagger.json'], dest: './dist/'}
        ]
      }
    },
		add_build_version: {
			default: {
				buildVersion: buildVersion
			}
		}
});

grunt.loadNpmTasks('grunt-aws-lambda');
grunt.loadNpmTasks('grunt-replace');

grunt.registerMultiTask('api_gateway_deploy', 'Upload api gateway from swagger json and deploy it on stage', function () {
	var restApiId = this.data.restApiId,
		swaggerPath = this.data.swaggerPath,
		stage = this.data.stage
		done = this.async(),
		apiGateway = new ApiGateway(region, grunt.log);

	apiGateway.putRestApi(restApiId, swaggerPath)
				.then(data => apiGateway.createDeployment(restApiId, stage))
				.then(done)
				.catch(grunt.fail.warn);
});

grunt.registerMultiTask('add_build_version', 'test', function() {
	var packageJsonPath = 'package.json',
			packageJson = grunt.file.readJSON(packageJsonPath),
			buildVersion = this.data.buildVersion;
	
	packageJson.version = buildVersion ? `${packageJson.version}-${buildVersion}` : packageJson.version;

	grunt.file.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
});

grunt.registerTask('deploy', ['lambda_package:all', 'lambda_deploy:getLatest', 'lambda_deploy:getResource', 'replace:apiGatewaySwagger', 'api_gateway_deploy']);