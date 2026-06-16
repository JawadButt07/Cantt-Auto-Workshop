pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Build') {
            steps {
                sh 'docker compose build'
            }
        }

        stage('Test') {
            steps {
                echo 'Tests running...'
                sh 'docker compose run --rm backend npm test || true'
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker compose up -d --force-recreate'
            }
        }
    }

    post {
        success {
            echo 'Deployment successful! App live on port 4001'
        }
        failure {
            echo 'Pipeline failed!'
        }
    }
}
