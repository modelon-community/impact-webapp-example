/*
 * Modelon Impact Webapp Example
 *
 * Copyright 2020 Modelon AB
 *
 * See LICENSE for terms
 */

const impact = require("impact-client");
const Plotly = require("plotly.js-dist");

impact.cloneWorkspace().then(cloneDescriptor => {
  const apiClient = impact.createClient(cloneDescriptor.workspaceId);

  const variablesSelectX = document.querySelector("#x-variables");
  const variablesSelectY = document.querySelector("#y-variables");
  const statusDiv = document.querySelector("#status");
  const resultDiv = document.querySelector("#results");

  const currentModel = "Modelica.Fluid.Examples.HeatingSystem";

  /**
   * Fetches the values for the selected x and y variables and plots them
   */
  async function plot(experimentId) {
    const x = variablesSelectX.value;
    const y = variablesSelectY.value;
    const result = await apiClient.getVariables(experimentId, [x, y]);

    const data = [
      {
        x: result[x][0],
        y: result[y][0],
        type: "scatter"
      }
    ];

    const layout = {
      xaxis: { title: x },
      yaxis: { title: y }
    };

    Plotly.newPlot("plotlyContainer", data, layout);
  }

  function addDropDownOption(select, name) {
    const option = document.createElement("option");
    option.value = name;
    option.innerHTML = name;
    select.appendChild(option);
  }

  function setStatus(status) {
    statusDiv.innerHTML = status;
  }

  (async function() {
    try {
      setStatus(`Compiling ${currentModel}...`);

      const fmuId = await apiClient.compile(currentModel);
      setStatus(`Simulating ${currentModel}...`);

      const experimentId = await apiClient.simulate(fmuId, {
        start_time: 0,
        final_time: 6000
      });

      const variableNames = await apiClient.getVariableNames(experimentId);
      variableNames.forEach(variableName => {
        addDropDownOption(variablesSelectX, variableName);
        addDropDownOption(variablesSelectY, variableName);
      });
      variablesSelectX.value = "time";

      resultDiv.style.display = "block";
      setStatus("");

      plot(experimentId);
      variablesSelectX.addEventListener("change", () => plot(experimentId));
      variablesSelectY.addEventListener("change", () => plot(experimentId));
    } catch (error) {
      setStatus(error);
    }
  })();
});
