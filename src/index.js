/*
 * Modelon Impact Webapp Example
 *
 * Copyright 2020 Modelon AB
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions
 * are met:
 *
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above copyright
 *    notice, this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 *
 * 3. Neither the name of the copyright holder nor the names of its
 *    contributors may be used to endorse or promote products derived from
 *    this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
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
