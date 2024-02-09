import { Client } from '@modelon/impact-client-js';

const createClient = async () => {
  const { impactToken, jupyterHubToken, jupyterHubUserPath } = await getJupyterHubTokensAndUserPath();
  // TODO: Client refreshes the impactToken if null -> it might still timeout? Client.fromCookie or similar should exist
  // TODO: Need to set token and path (at least in dev mode) -> should also be possible to calculate in client
  const client = Client.fromImpactToken({ impactToken, jupyterHubToken, jupyterHubUserPath }); 
  return client;
};

const getJupyterHubTokensAndUserPath = async () => {
  const impactToken = getCookieValue("access_token");
  const jupyterHubUserPath = getJupyterHubUserPath();
  const jupyterHubToken = await getJupyterHubToken();
  return { impactToken, jupyterHubToken, jupyterHubUserPath };
}

const getCookieValue = (key) =>  {
  const parts = `; ${document.cookie}`.split(`; ${key}=`);
  return parts.length === 2 ? parts.pop().split(";").shift() : undefined;
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
