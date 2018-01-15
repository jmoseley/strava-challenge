# strava-challenge [![Build Status](https://travis-ci.org/jmoseley/strava-challenge.svg?branch=master)](https://travis-ci.org/jmoseley/strava-challenge)

Create public/private challenges for you and your friends.

## Local Development

```bash
# install mongodb. suggestion:
brew install mongodb
# get mongodb running on port 27017: suggestion:
mkdir -p .data/db mongod --dbpath .data/db &

# install dependencies
$ npm install # Or yarn install

# serve with hot reload at localhost:3000
$ npm run dev
```

## Production Development

```
# build for production and launch server
$ npm run build
$ npm start

# generate static project
$ npm run generate
```

For detailed explanation on how things work, checkout the [Nuxt.js docs](https://github.com/nuxt/nuxt.js).
