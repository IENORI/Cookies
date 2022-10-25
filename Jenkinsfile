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
                sh 'cd backend'
                sh 'rm package-lock.json'
                sh 'npm install'
                sh 'cd ..'
                sh 'cd frontend'
                sh 'npm install'
                sh 'cd ..'
            }
        }
    }
}