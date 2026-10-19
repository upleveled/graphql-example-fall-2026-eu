import { postgresJsConfig, setEnvironmentVariables } from './util/config.ts';

// Read in values from .env file to process.env
setEnvironmentVariables();

const options = postgresJsConfig;

export default options;
