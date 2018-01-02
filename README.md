# strava-challenge [![Build Status](https://travis-ci.org/jmoseley/strava-challenge.svg?branch=master)](https://travis-ci.org/jmoseley/strava-challenge)
Create public/private challenges for you and your friends.

## Local Development

1. Install dependencies: `npm install`
1. Run: `npm run dev` or `npm start`.

`npm run dev` will watch for changes in `src` and restart as needed.

### Tests

`npm run test`

All test files are saved beside the source, under the `__tests__` directory.

### Local Dev with Mongo DB

For the live site we use mongodb for persistence, so it's nice to be able to test that locally too.

1. Install MongoDB. Perhaps `brew install mongodb && mongod`.
1. Start MongoDB on port `27017`. Perhaps `mkdir -p .data/db mongod --dbpath .data/db &`.
1. Modify `config/development.json` so `storage_type` is `mongodb`.
