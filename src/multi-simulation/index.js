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
  const simulateButton = document.querySelector("#simulate");
  const modelNameInput = document.querySelector("#modelname");
  const rangeVariableSelect = document.querySelector("#range-variable");
  const min = document.querySelector("#min");
  const max = document.querySelector("#max");
  const steps = document.querySelector("#steps");
  const resultDiv = document.querySelector(".results");
  const experiment = document.querySelector(".experiment");

  let simulated = false;
  let experimentId;

  const plot = () => {
    apiClient
      .getVariables(experimentId, [
        variablesSelectX.value,
        variablesSelectY.value
      ])
      .then(result => {
        const data = result[variablesSelectY.value].map((r, i) => ({
          x: result[variablesSelectX.value][i],
          y: r
        }));

        const layout = {
          xaxis: {
            title: variablesSelectX.value
          },
          yaxis: {
            title: variablesSelectY.value
          }
        };

        Plotly.newPlot("plotlyContainer", data, layout);
      });
  };

  simulateButton.addEventListener("click", event => {
    event.preventDefault();
    resultDiv.style.display = "none";

    apiClient.compile(modelNameInput.value).then(fmuId =>
      apiClient
        .simulate(
          fmuId,
          { start_time: 0, final_time: 4 },
          simulated
            ? {
                [rangeVariableSelect.value]: `range(${min.value},${max.value},${steps.value})`
              }
            : {}
        )
        .then(id => {
          experimentId = id;
          simulated = true;
          resultDiv.style.display = "block";
          experiment.style.display = "block";

          apiClient.getVariableNames(experimentId).then(names => {
            names.forEach(name => {
              [variablesSelectX, variablesSelectY, rangeVariableSelect].forEach(
                select => {
                  const option = document.createElement("option");
                  option.value = name;
                  option.innerHTML = name;
                  select.appendChild(option);
                }
              );
            });
            variablesSelectX.value = "time";
            plot();
          });
        })
    );
  });

  variablesSelectX.addEventListener("change", plot);
  variablesSelectY.addEventListener("change", plot);
});
