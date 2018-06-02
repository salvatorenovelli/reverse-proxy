#!/bin/sh


export GCE_PROJECT_ID="$(gcloud config get-value project -q)"
export VERSION=`jq -r '.version' package.json`
export ARTIFACT_ID=`jq -r '.name' package.json`

export IMAGE_TAG=gcr.io/${GCE_PROJECT_ID}/${ARTIFACT_ID}:${VERSION}


if [ -z "$1" ]
  then
    echo "No argument supplied"
    exit
fi


case $1 in
    "build" )
        echo "Building ${IMAGE_TAG}"
        npm install
        docker build -t ${IMAGE_TAG} .
    ;;
    "run" )
        docker run -it --rm -p 5000:80 ${IMAGE_TAG}
    ;;
    "push" )
        gcloud docker -- push ${IMAGE_TAG}
    ;;
    "deploy" )
        kubectl delete -f k8s/production.yaml
        sed -i.bak "s#<IMAGE_TAG_DO_NOT_EDIT>#${IMAGE_TAG}#" k8s/production.yaml
        kubectl apply -f k8s/production.yaml
        mv k8s/production.yaml.bak k8s/production.yaml
    ;;
esac





