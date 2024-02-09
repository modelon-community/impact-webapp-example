import { Client } from '@modelon/impact-client-js';

const createClient = async () => {
  const { jupyterHubToken, jupyterHubUserPath } = await getJupyterHubTokensAndUserPath();
  // TODO: Client refreshes the impactToken if null -> it might still timeout? Client.fromCookie or similar should exist
  // TODO: Need to set token and path (at least in dev mode) -> should also be possible to calculate in client
  const client = Client.fromImpactToken({ impactToken: null, jupyterHubToken, jupyterHubUserPath }); 
  return client;
};

const getJupyterHubTokensAndUserPath = async () => {
  const jupyterHubUserPath = getJupyterHubUserPath();
  const jupyterHubToken = await getJupyterHubToken();
  return { jupyterHubToken, jupyterHubUserPath };
}

const getJupyterHubUserPath = () => window.location.pathname.match(/\/user\/[^\/]+\//)[0] + "impact/"; 

const getJupyterHubToken = async () => {
  const tokenUrl = getJupyterHubUserPath() + "api/workspace-management/token";
  return await makeRequest(tokenUrl, {
    method: 'GET',
  });
};

const makeRequest = (url, method) => {
  return fetch(url, method)
    .then(response => {
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      return response.text();
    })
    .catch(error => {
      console.error('Request failed:', error.message);
      throw error;
    });
};

export default createClient;
