#!groovy

try {
    def jenkinsShared;
    def isProd = params.ENVIRONMENT == 'prod';
    node {
        stage('Checkout') {
            deleteDir()
            checkout scm
            jenkinsShared = load "scripts/JenkinsShared.groovy"
            jenkinsShared.exampleMethod()
        }

        stage('Build and deploy') {
            def jenkinsNodeVersion = tool 'NodeJS 4.3.2'
            withEnv(["PATH+NODE=${jenkinsNodeVersion}/bin", "ENVIRONMENT=${ENVIRONMENT}"]) {
                // Execute build script
                sh './scripts/build-and-deploy.sh sandbox'
                // Publish JsHint results
                step([$class: 'CheckStylePublisher', canComputeNew: false, defaultEncoding: '', healthy: '', pattern: '**/jshint-checkstyle.xml', unHealthy: ''])
            }
            if (!isProd) {
                def sha1 = sh(returnStdout: true, script: 'git rev-parse HEAD').trim().take(8)
                println "\n ==== Successfully completed deployment of commit " + sha1 + "===="
            }
        }
    }

    if (isProd) {
        stage('Update STABLE alias') {
            def moveStableLabel = false
            try {
                timeout(time: 2, unit: 'MINUTES') {
                    moveStableLabel = input message: 'Confirm deployment', parameters: [booleanParam(defaultValue: false, description: 'To complete deployment the STABLE alias needs to be moved.', name: 'Move the STABLE alias')]
                }
            } catch (err) {
                println "Marking build as failed due to timeout when waiting for confirmation to move STABLE alias"
                throw err
            }
            node {
                if (moveStableLabel) {
                    echo "Moving stable label"
                    def jenkinsNodeVersion = tool 'NodeJS 4.3.2'
                    echo "Setting production label!"
                } else {
                    println "Marking build as failed due to not moving STABLE alias"
                    currentBuild.result = 'FAILURE'
                }
            }
        }
    }
}
catch (err) {
    // Set build result so that it is picked up by mailer
    println "Build failed " + err
    currentBuild.result = 'FAILURE'
    throw err
}
finally {
    node {
        step([$class: 'Mailer', recipients: 'awsjenkins@animaconnected.onmicrosoft.com', sendToIndividuals: false])
        // Publish test results
        step([$class: 'JUnitResultArchiver', testResults: '**/xunit*.xml'])
    }
}
