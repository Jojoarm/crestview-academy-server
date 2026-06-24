import { BrevoClient } from '@getbrevo/brevo';
import { env } from '../utils/env.js';

export function getBrevoClient() {
  return new BrevoClient({
    apiKey: env.BREVO_API_KEY,
  });
}
