#!/bin/bash

echo "=== Syncing to linode server ==="
rsync -av --delete -e ssh --verbose -r . linode:fart10 --exclude=.git/ --exclude=node_modules

echo "=== Restarting Docker containers ==="
ssh linode "cd ~/fart10 && docker-compose down && docker-compose up --build -d"
