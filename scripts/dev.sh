#!/bin/sh

SKIP_INSTALL=1 forever -t --watch --watchDirectory src --watchIgnore __tests__ --minUptime 1000 --spinSleepTime 1000 -c "npm start" ./
