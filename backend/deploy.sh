STAGE=$1
TAG=deploy_${STAGE}_$(date +%d-%m-%Y_%H-%M-%S)
git tag $TAG
git push origin $TAG