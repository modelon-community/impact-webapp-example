import { Client } from '@modelon/impact-client-js';
import isDev from './isDev';

const createClient = async () => {
  if (isDev()) {
    return Client.fromImpactApiKey({ 
      impactApiKey: process.env.MODELON_IMPACT_API_KEY, 
      jupyterHubToken: process.env.JUPYTERHUB_API_TOKEN}); 
  } else {
    return Client.fromImpactSession({});
  }
};

const getCookieValue = (key) => {
  const parts = `; ${document.cookie}`.split(`; ${key}=`)

  return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined
}

export default createClient;