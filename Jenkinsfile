pipeline {
    agent any
    tools {nodejs "Default"}

    stages {
        stage("Fetch") {
            steps {
                git branch: "dev",
                    url: "https://github.com/IENORI/Cookies.git"
            }
        }
        stage("Install") {
            parallel {
                stage("Frontend") {
                    steps {
                        echo "This is from testpipeline branch"
                        dir('frontend') {
                            sh 'rm package-lock.json'
                            sh 'rm -rf node_modules'
                            sh 'npm install'
                        }
                    }
                }
                stage("Backend") {
                    steps {
                        dir('backend') {
                            sh 'rm package-lock.json'
                            sh 'rm -rf node_modules'
                            sh 'npm install'
                        }
                    }
                }
            }
        }
        stage("Test") {
            steps {
                dir('backend') {
                    sh 'npm test'
                }
            }
        }
        stage("Dep Check") {
            steps {
                dependencyCheck additionalArguments: '--format HTML --format XML --disableYarnAudit', odcInstallation: 'Default'
            }
        }
    }
    post {
        success {
            dependencyCheckPublisher pattern: 'dependency-check-report.xml'
        }
        always {
            junit testResults: 'backend/*.xml'
        }
    }
}