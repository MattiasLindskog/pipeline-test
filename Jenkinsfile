pipeline {
    options {
        disableConcurrentBuilds()
    }


    node {
        def jenkinsShared;
        def isProd = params.ENVIRONMENT == 'prod';


        stage('Get commit') {
            sh "git rev-parse --short HEAD > .git/commit-id"
            commit_id = readFile('.git/commit-id')
        }

        stage('Load shared library') {
            def rootDir = pwd()
            jenkinsShared = load "${rootDir}/scripts/JenkinsShared.Groovy "

            println 'Example method gave: ' + jenkinsShared.exampleMethod()

        }

        stage('First test') {
            sh 'env > env.txt'
            for (String i : readFile('env.txt').split("\r?\n")) {
                println i
            }
        }

        stage('Checkout') {
            checkout scm
        }
        stage('Build and deploy') {
            if(isProd) {
                println "Deploying to production!"
            }
            else {
                println "Deploying to sandbox"
            }

            def jenkinsNodeVersion = tool 'NodeJS 4.3.2'
            withEnv(["PATH+NODE=${jenkinsNodeVersion}/bin", "ENVIRONMENT=${ENVIRONMENT}"]) {

                // Execute build script
                sh './scripts/build-and-deploy.sh sandbox'

                // Publish JsHint results
                step([$class: 'CheckStylePublisher', canComputeNew: false, defaultEncoding: '', healthy: '', pattern: '**/jshint-checkstyle.xml', unHealthy: ''])
            }
            stash 'complete-workspace'
        }
    }

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
            prinln "Jenkins shared result in prod" + jenkinsShared.exampleMethod()

            if (userInput['dePloyToProd']) {
                echo "Deploying to prod..."
                unstash 'complete-workspace'
                def jenkinsNodeVersion = tool 'NodeJS 4.3.2'
                withEnv(["PATH+NODE=${jenkinsNodeVersion}/bin", "ENVIRONMENT=${ENVIRONMENT}"]) {

                    // Execute build script
                    sh './scripts/build-and-deploy.sh prod'
                }
                currentBuild.result = ''
            }
        }
    }

    post {
        changed {
            // Always notify mailer
            step([$class: 'Mailer', notifyEveryUnstableBuild: true, recipients: 'awsjenkins@animaconnected.onmicrosoft.com', sendToIndividuals: false])
        }
        always {
            // Publish test results
            step([$class: 'JUnitResultArchiver', testResults: '**/xunit*.xml'])
        }
    }
}