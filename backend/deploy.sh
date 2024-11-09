#!/bin/bash

STAGE=$1

# Check if STAGE is provided and is either "test" or "prod"
if [[ -z "$STAGE" || ( "$STAGE" != "test" && "$STAGE" != "prod" ) ]]; then
    echo "Error: You must provide a valid stage ('test' or 'prod') as the first argument."
    exit 1
fi

TAG=deploy_${STAGE}_$(date +%d-%m-%Y_%H-%M-%S)
git tag $TAG
git push origin $TAG
