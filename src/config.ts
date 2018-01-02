import * as convict from 'convict';

export const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  mongodb: {
    url: {
      doc: 'Address for MongoDB connection',
      format: 'url',
      default: undefined,
      env: 'MONGODB_URL',
    },
    user: {
      doc: 'MongoDB username',
      format: '*',
      default: undefined,
      env: 'MONGODB_USER',
    },
    pass: {
      doc: 'MongoDB password',
      format: '*',
      default: undefined,
      env: 'MONGODB_PASSWORD',
    },
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8765,
    env: 'PORT'
  },
  root_url: {
    doc: 'Root URL to access the application. EG http://strava-challenge.jeremymoseley.net',
    format: '*',
    default: null,
    env: 'ROOT_URL',
  },
  secret: {
    doc: 'The secret string used to secure cookies.',
    format: '*',
    default: undefined,
    env: 'SECRET',
  },
  storage_type: {
    doc: 'The type of storage to use.',
    // TODO: Add persistent type, like DynamoDB.
    format: ['file', 'mongodb'],
    default: 'file',
  },
  strava: {
    access_token: {
      doc: 'The Strava App Access Token',
      format: '*',
      env: 'STRAVA_ACCESS_TOKEN',
      sensitive: true,
      default: null,
    },
    client_id: {
      doc: 'The Strava Client ID',
      format: '*',
      env: 'STRAVA_CLIENT_ID',
      default: null,
    },
    client_secret: {
      doc: 'The Strava Client Secret',
      format: '*',
      env: 'STRAVA_CLIENT_SECRET',
      sensitive: true,
      default: null,
    },
  },
});

// Load environment dependent configuration
const env = config.get('env') as string;
config.loadFile('./config/' + env + '.json');

// Perform validation
config.validate({allowed: 'strict'});
