#!/bin/bash

docker compose \
    -f docker-compose.yaml run --rm --build \
    -p 8080:8080 \
    website_local