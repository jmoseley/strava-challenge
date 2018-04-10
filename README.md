# strava-challenge [![Build Status](https://travis-ci.org/jmoseley/strava-challenge.svg?branch=master)](https://travis-ci.org/jmoseley/strava-challenge)

Create public/private challenges for you and your friends.

## Local Development

1. Install Meteor: https://www.meteor.com/install
1. Install dependencies: `meteor npm install`
1. Run: `meteor --port 8765 --setings config/development.json`.

### Sending Email

1. Run with Sendgrid API key and dev email: `SENDGRID_API_KEY="<api key>" DEV_EMAIL="<your email address>" meteor --port 8765 --settings config/development.json`
