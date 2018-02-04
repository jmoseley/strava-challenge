#!/bin/sh

prettier --single-quote --trailing-comma all --write "{src, config, client}/**/*.{js,json,md,ts,tsx}"

tsc --sourceMap
