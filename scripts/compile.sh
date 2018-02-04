#!/bin/sh

prettier --single-quote --trailing-comma all --write "{src, config}/**/*.{js,json,md,ts}"

(cd client && npm run build)

tsc --sourceMap
