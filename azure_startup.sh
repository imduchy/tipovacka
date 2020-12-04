#!/bin/bash
set -e

echo "Starting SSH ..."
service ssh start

# Start the Nuxt app
npm start
