pipeline {
  agent any

  options {
    skipDefaultCheckout(true)
    timestamps()
    timeout(time: 30, unit: 'MINUTES')
    buildDiscarder(logRotator(numToKeepStr: '20', artifactNumToKeepStr: '10'))
    disableConcurrentBuilds()
  }

  parameters {
    choice(
      name: 'TEST_SUITE',
      choices: ['smoke', 'all', 'ui', 'api', 'a11y', 'visual'],
      description: 'Playwright suite to run.'
    )
  }

  environment {
    CI = 'true'
    JENKINS = 'true'
    SKIP_UI_AUTH = '0'
    PATH+DOCKER = '/opt/homebrew/bin:/usr/local/bin:/Applications/Docker.app/Contents/Resources/bin'
    COMPOSE_PROJECT_NAME = "playwright-jenkins-${BUILD_NUMBER}"
  }

  stages {
    stage('Checkout source') {
      steps {
        checkout scm
      }
    }

    stage('Verify Docker and Docker Compose access') {
      steps {
        script {
          def safeJobName = env.JOB_NAME.toLowerCase().replaceAll(/[^a-z0-9_-]/, '-')
          env.COMPOSE_PROJECT_NAME = "playwright-jenkins-${safeJobName}-${env.BUILD_NUMBER}"
        }
        sh '''
          command -v docker || {
            echo "Docker CLI is not on the Jenkins PATH. Configure the agent PATH or install Docker for the Jenkins service user."
            exit 1
          }
          docker version
          docker compose version
          docker info >/dev/null
        '''
      }
    }

    stage('Build test image') {
      steps {
        sh 'docker compose -p "$COMPOSE_PROJECT_NAME" build tests'
      }
    }

    stage('Run typecheck') {
      steps {
        sh 'docker compose -p "$COMPOSE_PROJECT_NAME" run --rm tests npm run typecheck'
      }
    }

    stage('Run Playwright tests') {
      steps {
        script {
          def suiteCommands = [
            all: 'npm test',
            smoke: 'npm run test:smoke',
            ui: 'npm run test:ui',
            api: 'npm run test:api',
            a11y: 'npm run test:a11y',
            visual: 'npm run test:visual',
          ]
          env.TEST_COMMAND = suiteCommands[params.TEST_SUITE]
          def skipUiAuth = params.TEST_SUITE == 'api' ? '1' : '0'

          withCredentials([
            usernamePassword(
              credentialsId: 'restful-booker-api',
              usernameVariable: 'API_USER',
              passwordVariable: 'API_PASSWORD'
            ),
          ]) {
            withEnv(["SKIP_UI_AUTH=${skipUiAuth}"]) {
              sh 'docker compose -p "$COMPOSE_PROJECT_NAME" run --rm tests sh -lc "$TEST_COMMAND"'
            }
          }
        }
      }
    }
  }

  post {
    always {
      junit testResults: 'test-results/junit.xml', allowEmptyResults: true
      archiveArtifacts(
        artifacts: 'playwright-report/**/*,test-results/**/*',
        allowEmptyArchive: true,
        fingerprint: true
      )
      script {
        def cleanupStatus = sh(
          script: 'docker compose -p "$COMPOSE_PROJECT_NAME" down --volumes --remove-orphans',
          returnStatus: true
        )
        if (cleanupStatus != 0) {
          echo "Docker Compose cleanup returned status ${cleanupStatus}."
        }
      }
    }
  }
}
