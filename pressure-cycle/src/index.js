/*
* Modelon Impact Webapp Example
*
* Copyright 2020 Modelon AB
*
* See LICENSE for terms
*/

import Plotly from 'plotly.js-dist';
import { Analysis, Client, ExperimentDefinition } from '@modelon/impact-client-js';

const getCookieValue = (key) => {
  const parts = `; ${document.cookie}`.split(`; ${key}=`);
  return parts.length === 2 ? parts.pop().split(";").shift() : undefined;
};

const makeRequest = (url, method) => {
  // Base URL for api
  return fetch(url, method)
    .then(response => {
      // Check if the response status is OK (status code 200-299)
      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      // Parse the response body as JSON
      return response.json();
    })
    .catch(error => {
      console.error('Request failed:', error.message);
      throw error; // Rethrow the error to handle it at the caller level if needed
    });
};

const getQueryParameter = () => {
  const queryString = window.location.search;
  const searchParams = new URLSearchParams(queryString);
  return searchParams.get(parameter);
}

const getJupyterHubUserPath = () => window.location.pathname.split("/impact/")[0] + "/impact/";

const getImpactToken = () => getCookieValue("access_token");

const getJupyterHubToken = async () => {
  const tokenUrl = getJupyterHubUserPath + "api/workspace-management/token";
  return await makeRequest(tokenUrl, "get")
};

const getServerAddress = () => window.location.origin;

const createClient = async () => {
  const impactToken = getImpactToken();
  const jupyterHubUserPath = getJupyterHubUserPath();
  const serverAddress = getServerAddress();
  const jupyterHubToken = await getImpactToken();
  const client = Client.fromImpactToken({impactToken, jupyterHubToken, jupyterHubUserPath, serverAddress});
  return client;
}

createClient.then(client => {
  let variables = {};
  const modelName = getQueryParameter("model");
  const workspaceId =  getQueryParameter("workspaceId");
  const myform = document.getElementById("myform");

  // hook up input change events to dispatch setParameter event
  myform.elements["height"].addEventListener("change", event => {
    variables["handle.height"] = event.target.value;
  });
  myform.elements["heightSlider"].addEventListener("change", event => {
    myform.elements["height"].value = event.target.value;
    variables["handle.height"] = event.target.value;
  });
  myform.elements["p_a_nominal"].addEventListener("change", event => {
    variables["pump.p_a_nominal"] = event.target.value;
  });

  // hook up simulation button to dispatch simulate event
  myform.elements["simulate"].addEventListener("click", async event => {
    event.preventDefault();
    myform.elements["simulate"].disabled = true;
    const workspace = await client.getWorkspace(workspaceId);
    const experimentDefinition = ExperimentDefinition.from({
      analysis: Analysis.from({
        type: "dynamic",
        parameters: { start_time: 0, final_time: 6000 },
      }),
      model: Model.from({ className: modelName }),
      modifiers: { variables },
    });  

    const experiment = await workspace.executeExperimentUntilDone({
      experimentDefinition,
    });

    myform.elements["simulate"].disabled = false;

    const trajectories = await experiment.getTrajectories([
      "tank.ports[1].p",
      "tank.ports[2].p",
      "pump.port_a.p",
      "pump.port_b.p",
      "heater.port_a.p",
      "heater.port_b.p",
      "pipe.port_a.p",
      "pipe.port_b.p",
      "valve.port_a.p",
      "valve.port_b.p",
      "radiator.port_a.p",
      "radiator.port_b.p"
    ]);
    
    const index = trajectories["tank.ports[1].p"][0].length - 1;

    const labels = [
      "tank",
      "pump",
      "heater",
      "pipe",
      "valve",
      "radiator"
    ];

    const values = [
      trajectories["tank.ports[2].p"][0][index] -
        trajectories["tank.ports[1].p"][0][index],
      trajectories["pump.port_b.p"][0][index] -
        trajectories["pump.port_a.p"][0][index],
      trajectories["heater.port_b.p"][0][index] -
        trajectories["heater.port_a.p"][0][index],
      trajectories["pipe.port_b.p"][0][index] -
        trajectories["pipe.port_a.p"][0][index],
      trajectories["valve.port_b.p"][0][index] -
        trajectories["valve.port_a.p"][0][index],
      trajectories["radiator.port_b.p"][0][index] -
        trajectories["radiator.port_a.p"][0][index]
    ];

    const y = values.reduce(
      (acc, value, i) => [...acc, acc[i] + value],
      [0]
    );

    const colors = {
      positive: "rgba(55, 128, 191, 0.7)",
      negative: "rgba(219, 64, 82, 0.7)"
    };

    const data = [
        {
          x: labels,
          y: y,
          type: "bar",
          marker: {
            color: "rgba(1,1,1,0.0)"
          },
          hoverinfo: "none"
        },
        ...values.map((value, i) => ({
          x: labels,
          y: values.map((_, j) => (i === j ? value : 0)),
          type: "bar",
          marker: {
            color: value > 0 ? colors.positive : colors.negative
          },
          hoverinfo: "none"
        }))
    ];

    const layout = {
      title: "Pressure cycle",
      barmode: "stack",
      autosize: true,
      showlegend: false,
      annotations: values.map((value, i) => ({
        x: labels[i],
        text: Math.round(value) + "k",
        font: {
          family: "Arial",
          size: 12,
          color: "rgba(0, 0, 0, 1)"
        },
        showarrow: false,
        y: y[i] + value / 2
      }))
    };

    Plotly.newPlot("plotlyContainer", data, layout, {
      displayModeBar: false
    });
  });
});
