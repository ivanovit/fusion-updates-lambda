#!groovy
def amazonBucket = "s3://tap-devops-private/appbuilder/builds/ab_fusion"
def buildVersion = VersionNumber(versionNumberString: 'v.${BUILD_DATE_FORMATTED, \"yyyy.MM.dd\"}.${BUILDS_TODAY}')

node("linux") {
    ansiColor("xterm") {
        timestamps {
            stage ("Checkout project") {
                checkout scm
                sh "git clean -fdx"
                sh "git reset --hard"
            }

            docker.image("mkenney/npm").inside() {
                stage ("Install project dependecies") {
                    sh "npm prune && npm install"
                }
                
                stage ("Package aws lambda") {
                    sh "grunt add_build_version --buildVersion=${buildVersion}"
                    sh "grunt lambda_package:all"
                }
            }

            stage("Upload results") {
                docker.image("anigeo/awscli").inside("-e AWS_DEFAULT_REGION=us-east-1") {
                    withCredentials([[$class: "StringBinding", credentialsId: "private_aws_access_key_id", variable: "AWS_ACCESS_KEY_ID"],
                        [$class: "StringBinding", credentialsId: "private_aws_secret_access_key", variable: "AWS_SECRET_ACCESS_KEY"]]) {
                            sh ("aws s3 cp dist  ${amazonBucket} --recursive --exclude \"*\" --include \"fusion_updates_service*.zip\"")
                    }
                }
            }
        }
    }
}
