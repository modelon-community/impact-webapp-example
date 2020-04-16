/*
 * Modelon Impact Webapp Example
 *
 * Copyright 2020 Modelon AB
 *
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"),
 * to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense,
 * and/or sell copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included
 * in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 */

const impact = require("impact-js-sdk");
const Plotly = require("plotly.js-dist");

window.WAMS_AUTH_JWT_COOKIE_NAME = "jwt";
impact.cloneWorkspace("nisses", 5).then(cloneDescriptor => {
  const apiClient = impact.createClient(cloneDescriptor.workspaceId);

  let variables = {};
  const modelName = "Modelica.Fluid.Examples.HeatingSystem";
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
  myform.elements["simulate"].addEventListener("click", event => {
    event.preventDefault();

    myform.elements["simulate"].disabled = true;

    apiClient.compile(modelName).then(fmuId =>
      apiClient.simulate(fmuId, 0, 6000, variables).then(experimentId => {
        myform.elements["simulate"].disabled = false;

        apiClient
          .getVariables(experimentId, [
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
          ])
          .then(result => {
            const index = result["tank.ports[1].p"][0].length - 1;

            const labels = [
              "tank",
              "pump",
              "heater",
              "pipe",
              "valve",
              "radiator"
            ];

            const values = [
              result["tank.ports[2].p"][0][index] -
                result["tank.ports[1].p"][0][index],
              result["pump.port_b.p"][0][index] -
                result["pump.port_a.p"][0][index],
              result["heater.port_b.p"][0][index] -
                result["heater.port_a.p"][0][index],
              result["pipe.port_b.p"][0][index] -
                result["pipe.port_a.p"][0][index],
              result["valve.port_b.p"][0][index] -
                result["valve.port_a.p"][0][index],
              result["radiator.port_b.p"][0][index] -
                result["radiator.port_a.p"][0][index]
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
      })
    );
  });
});
