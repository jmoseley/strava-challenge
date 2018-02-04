#!/bin/sh

mkdir -p .data/db
mongod --dbpath .data/db > /dev/null &
# Kill MongoDB when the script is stopped.
trap 'kill $(jobs -p)' EXIT
trap 'kill 0' EXIT

NODE_ENV=development forever -t --watch --watchDirectory src --watchIgnore __tests__ --minUptime 1000 --spinSleepTime 1000 -c "npm start" ./
