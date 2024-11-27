#!/bin/sh

curl localhost:3000/buildings \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"name": "Building 1"}' 
