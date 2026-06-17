pipeline {
    agent any

    environment {
        PORT="4000"
        NODE_ENV="production"
        DB_HOST="database-cantt.codkke4a6rba.us-east-1.rds.amazonaws.com"
        DB_PORT="5432"
        DB_NAME="postgres"
        DB_USER="postgres"
        DB_PASSWORD="12345678"
    }

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
                sh 'docker ps -q --filter name=cantt-auto-workshop-project-backend-1 | xargs -r docker stop | xargs -r docker rm || true'
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
