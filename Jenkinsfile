pipeline {
    agent {
        docker {
            image 'node:lts-bullseye-slim' 
            args '-p 3000:3000 -p 5000:5000' 
        }
    }
    stages {
        stage('Build') { 
            steps {
                dir('backend') {
                    sh "pwd"
                }
            }
        }
    }
}