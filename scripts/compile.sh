#!/bin/sh

prettier --single-quote --trailing-comma all --write "{src, config}/**/*.{js,json,md,ts}"

tsc --sourceMap
