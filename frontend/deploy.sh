#!/bin/bash

# Require a stage argument
if [[ $# -ne 1 ]]; then
  echo "Error: Please provide a stage argument (e.g., test, prod)."
  exit 1
fi

stage=$1

# Configuration for different stages
#declare -A config=(
#  ["test"]=(remote_user="samuele" remote_host="staging.example.com" remote_path="/opt/hermadata/frontend")
  #["prod"]=(remote_user="user3" remote_host="prod.example.com" remote_path="/var/www/prod")
#)

# Ensure the stage is defined in the configuration
#if [[ ! "${config[$stage]}" ]]; then
#  echo "Error: Invalid stage '$stage'."
#  exit 1
#fi

# Build the React app
npm run build

# Create the Git tag with timestamp
#timestamp=$(date +%Y%m%d-%H%M%S)
#git tag "deploy-fe-$stage-$timestamp"

# Rsync to the remote server
rsync -avz --delete dist/ meltdown:/opt/hermadata/frontend
# rsync -avz --delete dist/ "${config[$stage][@]}"

#echo "Deployment to $stage completed successfully!"
