#!/bin/bash



export GCE_PROJECT_ID="$(gcloud config get-value project -q)"
export VERSION=`jq -r '.version' package.json`
export ARTIFACT_ID=`jq -r '.name' package.json`

export IMAGE_TAG=gcr.io/${GCE_PROJECT_ID}/${ARTIFACT_ID}:${VERSION}


if [[ -z "$1" ]]
  then
    echo "No argument supplied"
    exit
fi

echo "Going to $1 ${IMAGE_TAG}"

confirm() {
    read -r -p "Do you want to continue? [y/N]" response
    case "$response" in
        [yY][eE][sS]|[yY])
            true
            ;;
        *)
            false
            ;;
    esac
}

RED='\033[1;31m'
GREEN='\033[1;32m'
YELLOW='\033[1;33m'
BLUE='\033[1;34m'
NO_COLOR='\033[0m'

case $1 in
    "cloud-build" )


        GIT_TAG_NAME=$(git tag -l --points-at HEAD)
        GIT_SHORT_SHA=$(git rev-parse --short HEAD)

        if [[ -z ${GIT_TAG_NAME} ]]
          then
            GIT_TAG_NAME="untagged"
        fi

        LOCAL_ID=$(whoami)_$(hostname)

        TAG_NAME=${LOCAL_ID}"."${GIT_TAG_NAME}
        SHORT_SHA=${LOCAL_ID}"."${GIT_SHORT_SHA}

        echo -e "Triggering remote build for:"
        echo -e " TAG: ${BLUE}${TAG_NAME}${NO_COLOR}"
        echo -e " SHA: ${BLUE}${SHORT_SHA}${NO_COLOR}"
        ! confirm  && exit


        SUBST=TAG_NAME=${TAG_NAME},SHORT_SHA=${SHORT_SHA}
        gcloud builds submit --substitutions=${SUBST} --machine-type=n1-highcpu-8
#       cloud-build-local --substitutions=${SUBST} --dryrun=false --write-workspace=../tmp_cloudbuildlocal .
    ;;
    "build" )
        yarn install || exit 1
        yarn build || exit 1
        rm -rf docker/build
        mv build docker
        echo "Building ${IMAGE_TAG}"
        docker build docker -t ${IMAGE_TAG}
    ;;
    "clean" )
        rm -rf build
        rm -rf docker/build
    ;;
    "run" )
        docker run --name ${ARTIFACT_ID} -it --rm -p 3001:3001 ${IMAGE_TAG}
    ;;
    "push" )
        gcloud docker -- push ${IMAGE_TAG}
    ;;
    "deploy" )
        kubectl delete -f k8s/production.yaml
        sed -i.bak "s#<IMAGE_TAG_DO_NOT_EDIT>#${IMAGE_TAG}#" k8s/production.yaml
        kubectl apply -f k8s/
        mv k8s/production.yaml.bak k8s/production.yaml
    ;;
    *)
        echo "'$1' is not a valid action"
    ;;
esac


