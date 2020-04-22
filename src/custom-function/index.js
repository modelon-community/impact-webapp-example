/*
 * Modelon Impact Webapp Example
 *
 * Copyright 2020 Modelon AB
 *
 * See LICENSE for terms
 */

const impact = require("impact-client");

impact.cloneWorkspace().then(cloneDescriptor => {
  const apiClient = impact.createClient(cloneDescriptor.workspaceId);

  const results = document.querySelector("#results");
  const button = document.querySelector("#execute");
  const functionNameInput = document.querySelector("#functionname");
  const modelNameInput = document.querySelector("#modelname");
  const messageInput = document.querySelector("#message");
  const countDerivativesInput = document.querySelector("#count_derivatives");

  const logRow = line => results.append(line + "\n");

  button.addEventListener("click", () => {
    const functionName = functionNameInput.value;
    const modelName = modelNameInput.value;
    const countDerivatives = countDerivativesInput.checked;
    const message = messageInput.value;

    logRow(`Calling ${functionName} function`);

    apiClient.compile(modelName).then(fmuId =>
      apiClient
        .simulate(
          fmuId,
          {
            message: message,
            count_derivatives: countDerivatives
          },
          null,
          functionName
        )
        .then(experimentId => {
          return apiClient
            .getLog(experimentId)
            .then(logRow)
            .then(() =>
              Promise.all(
                ["number_of_variables", "number_of_derivatives"].map(variable =>
                  apiClient.getVariable(experimentId, variable)
                )
              )
            );
        })
        .then(([numberOfVariables, numberOfDerivatives]) => {
          logRow(`The model contains ${numberOfVariables} variables!`);

          if (countDerivatives) {
            logRow(
              `The model contains ${numberOfDerivatives} derivative variables!`
            );
          }
        })
    );
  });
});
