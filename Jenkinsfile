#!groovy

try {
    def gitCommit;
    def isProd = params.ENVIRONMENT == 'prod';

    node {
        stage('Checkout') {
            deleteDir()
            checkout scm
            gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim().take(8)
        }

        stage('Build and deploy') {

            if (isProd) {
                println "Deploying to production!"
            } else {
                println "Deploying to sandbox"
            }

            def jenkinsNodeVersion = tool 'NodeJS 4.3.2'
            withEnv(["PATH+NODE=${jenkinsNodeVersion}/bin", "ENVIRONMENT=${ENVIRONMENT}"]) {
                // Execute build script
                sh './scripts/build-and-deploy.sh sandbox'
                // Publish JsHint results
                step([$class: 'CheckStylePublisher', canComputeNew: false, defaultEncoding: '', healthy: '', pattern: '**/jshint-checkstyle.xml', unHealthy: ''])
            }
            if(!isProd) {
                println "\n ==== Successfully completed deployment of commit " + gitCommit + "===="
            }
        }
    }

    if (isProd) {
        stage('Move STABLE label') {
            def moveStableLabel = false
            try {
                timeout(time: 2, unit: 'MINUTES') {
                    moveStableLabel = input message: 'Confirm deployment', parameters: [booleanParam(defaultValue: false, description: 'To complete deployment the STABLE alias needs to be moved.', name: 'Move the STABLE alias')]
                }
            } catch (err) {
                println "Marking current build as failed due to timeout when waiting for confirmation to move STABLE label"
                throw err
            }
            node {
                if (moveStableLabel) {
                    echo "Moving stable label"
                    def jenkinsNodeVersion = tool 'NodeJS 4.3.2'
                    echo "Setting production label!"
                }
            }
        }
    }
}
catch (err) {
    // Set build result so that it is picked up by mailer
    currentBuild.result = 'FAILURE'
    throw err
}
finally {
    node{
        // Always notify mailer
        step([$class: 'Mailer', recipients: 'awsjenkins@animaconnected.onmicrosoft.com', sendToIndividuals: false])

        // Publish test results
        step([$class: 'JUnitResultArchiver', testResults: '**/xunit*.xml'])
     }
}
