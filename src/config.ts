import * as convict from 'convict';

export const config = convict({
  env: {
    doc: 'The application environment.',
    format: ['production', 'development', 'test'],
    default: 'development',
    env: 'NODE_ENV'
  },
  port: {
    doc: 'The port to bind.',
    format: 'port',
    default: 8765,
    env: 'PORT'
  },
});

// Load environment dependent configuration
const env = config.get('env') as string;
config.loadFile('./config/' + env + '.json');

// Perform validation
config.validate({allowed: 'strict'});
