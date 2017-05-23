#!groovy

try {
    def isProd = params.ENVIRONMENT == 'prod';

    node {
        stage('Checkout') {
            deleteDir()
            checkout scm
        }

        stage('Info') {
            def gitCommit = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
            println "Will this be a commit? " + gitCommit
            println "Build and deploy for " + params.ENVIRONMENT + " (production=" + isProd + ")"

        }

        stage('Get commit') {
            sh "git rev-parse --short HEAD > .git/commit-id"
            commit_id = readFile('.git/commit-id')
            println "This is commit with id " + commit_id
        }

        stage('First test') {
            sh 'env > env.txt'
            for (String i : readFile('env.txt').split("\r?\n")) {
                // println i
            }
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
        }
    }

    if (isProd) {
        stage('Trigger deploy to production') {
            def userInput
            try {
                timeout(time: 3, unit: 'MINUTES') {
                    userInput = input message: 'Deploy to production?', parameters: [booleanParam(defaultValue: false, description: 'Use build to deploy in production', name: 'deployToProd')]
                }
            } catch (err) {
                echo "Timeout aborting..."
            }
            node {
                if (userInput['deployToProd']) {
                    echo "Deploying to prod..."
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
    // Always notify mailer
    step([$class: 'Mailer', notifyEveryUnstableBuild: true, recipients: 'awsjenkins@animaconnected.onmicrosoft.com', sendToIndividuals: false])

    // Publish test results
    step([$class: 'JUnitResultArchiver', testResults: '**/xunit*.xml'])
}
