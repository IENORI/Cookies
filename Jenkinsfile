pipeline {
    agent {
        docker {
            image 'node:lts-bullseye-slim' 
            args '-p 3000:3000 -p 5000:5000' 
        }
    }
    stages {
        stage("Dep Check") {
            steps {
                dependencyCheck additionalArguments: '--format HTML --format XML', odcInstallation: 'Default'
            }
        }
        stage('Build') { 
            steps {
                dir('backend') {
                    sh 'npm ci --omit=dev'
                }
                dir('frontend') {
                    sh 'npm ci --omit=dev'
                }
            }
        }
    }
}