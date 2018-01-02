#!/bin/sh

if [ -z $SKIP_INSTALL ]; then
  npm install
fi

npm run compile

node ./dist/start.js
