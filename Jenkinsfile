pipeline {
    agent {
        docker {
            image 'node:lts-bullseye-slim' 
            args '-p 3000:3000 -p 5000:5000' 
        }
    }
    stages {
        stage('Build') { 
            dir("backend"){
                sh 'npm install'
            }
            dir("frontend"){
                sh 'npm install'
            }
        }
    }
}