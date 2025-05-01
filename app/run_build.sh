#!/bin/bash

# Cleanup any existing website_build containers
docker rm -f $(docker ps -aq --filter "name=website_build") 2>/dev/null

#Remove local dist folder before starting the build
rm -rf ./website/.dist

# Run the build
docker compose \
    -f docker-compose.yaml run --rm --build \
    -d website_build

CONTAINER_ID=$(docker ps -q --filter name=website_build)
docker cp $CONTAINER_ID:/app/dist ./website/.dist