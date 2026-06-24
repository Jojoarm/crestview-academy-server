import { env } from '../utils/env.js';
import { Redis } from '@upstash/redis';
import logger from '../utils/logger.js';

const url = env.UPSTASH_REDIS_REST_URL;
const token = env.UPSTASH_REDIS_REST_TOKEN;

if (!url || !token) {
  throw new Error('Missing Upstash Redis environment variables');
}

const redisClient = new Redis({ url, token });

logger.info('Upstash Redis client initialized');

export default redisClient;
