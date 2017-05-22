
try{
    node('node') {

        stage('Checkout') {
            checkout scm: [
                    $class: 'GitSCM',
                    branches: [[name: '*/master']],
                    userRemoteConfigs: [[url: 'https://github.com/MattiasLindskog/pipeline-test']],
                    extensions: [
                            [$class: 'CleanBeforeCheckout']
                    ]
            ]
        },
        stage('Build and deploy to sandbox') {
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
        def userInput = input message: 'Deploy to production?', parameters: [booleanParam(defaultValue: false, description: 'Use build to deploy in production', name: 'deployToProd')]
        if(userInput['dePloyToProd']){

            node('node') {
                unstash 'complete-workspace'
                def jenkinsNodeVersion = tool 'NodeJS 4.3.2'
                withEnv(["PATH+NODE=${jenkinsNodeVersion}/bin", "ENVIRONMENT=${ENVIRONMENT}"]) {

                    // Execute build script
                    sh './scripts/build-and-deploy.sh prod'
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


