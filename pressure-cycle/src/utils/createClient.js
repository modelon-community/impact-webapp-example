import { Client } from '@modelon/impact-client-js';
import isDev from './isDev';

const createClient = async () => {
  if (isDev()) {
    return Client.fromImpactApiKey({ 
      impactApiKey: process.env.MODELON_IMPACT_API_KEY, 
      jupyterHubToken: process.env.JUPYTERHUB_API_TOKEN}); 
  } else {
    return Client.fromImpactToken({
      impactToken: getCookieValue('access_token'), // TODO: Cookie times out after a while and we need to log back in -> should also be solved by API Gateway with impact-session
      jupyterHubToken: process.env.JUPYTERHUB_API_TOKEN, // TODO: This is a hack, we should never compile the token into the app -> but should be solved by API Gateway with impact-session
    });
  }
};

const getCookieValue = (key) => {
  const parts = `; ${document.cookie}`.split(`; ${key}=`)

  return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined
}

export default createClient;