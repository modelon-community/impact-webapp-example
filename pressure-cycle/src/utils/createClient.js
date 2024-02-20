import { Client } from '@modelon/impact-client-js';
import isDev from './isDev';

const createClient = async () => {
  
  if (isDev()) {
    return Client.fromImpactApiKey({ 
      impactApiKey: process.env.MODELON_IMPACT_API_KEY, 
      jupyterHubToken: process.env.JUPYTERHUB_API_TOKEN, 
      jupyterHubUserPath: process.env.JUPYTERHUB_SERVICE_PREFIX,
      serverAddress: process.env.MODELON_IMPACT_CLIENT_URL }); 
  } else {
    const impactToken = getCookieValue('access_token'); // TODO: Cookie times out after a while and we need to log back in -> should also be solved by API Gateway
    const jupyterHubToken = process.env.JUPYTERHUB_API_TOKEN; // TODO: This is a hack -> but is solved by API Gateway when we get that
    const jupyterHubUserPath = window.location.pathname.split("impact/")[0];
    const serverAddress = window.location.origin;
    return Client.fromImpactToken({impactToken, jupyterHubToken, jupyterHubUserPath, serverAddress});
  }
};

const getCookieValue = (key) => {
  const parts = `; ${document.cookie}`.split(`; ${key}=`)

  return parts.length === 2 ? parts.pop()?.split(';').shift() : undefined
}

export default createClient;