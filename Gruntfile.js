var grunt = require('grunt'),
	target = grunt.option('target') || "dev"

grunt.loadNpmTasks('grunt-aws-lambda');

grunt.initConfig({
   lambda_deploy: {
	  getLatest: {
		arn: "arn:aws:lambda:eu-central-1:568715433797:function:getLatest",
		 options: {
			region: "eu-central-1",
			handler: "lambda.getLatest",
			aliases: target,
            enableVersioning: true
		 },
		 package: "<%= lambda_deploy.all.package %>"
	  },
	  getResource: {
		 arn: "arn:aws:lambda:eu-central-1:568715433797:function:getResource",
		 options: {
			region: "eu-central-1",
			handler: "lambda.getResource",
			aliases: target,
            enableVersioning: true
		 },
		 package: "<%= lambda_deploy.all.package %>"
	  }
   },
   lambda_package: {
		all: {}
   }
});

grunt.registerTask('deploy', ['lambda_package:all', 'lambda_deploy:getLatest', 'lambda_deploy:getResource'])