node {
    def project = 'website-versioning'
    def appName = 'website-versioning-proxy'

    def imageTag = "gcr.io/${project}/${appName}:${env.BRANCH_NAME}.${env.BUILD_NUMBER}"

    checkout scm

    stage 'Build project'

    sh("yarn install")
    sh("yarn build")

    stage 'Build image'
    sh("rm -rf docker/build")
    sh("mv build docker")
    sh("docker build docker -t ${imageTag}")

}
