#!/bin/sh

npm run compile

NODE_ENV=test jest
