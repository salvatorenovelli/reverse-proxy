node {
    def project = 'commons'
    def appName = 'commons-reverseproxy'

    def imageTag = "gcr.io/${project}/${appName}:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"

    checkout scm

    stage 'Build project'

    sh("npm install")

    stage 'Build image'
    sh("docker build . -t ${imageTag}")
}
