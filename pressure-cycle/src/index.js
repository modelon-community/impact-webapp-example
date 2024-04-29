/*
 * Modelon Impact Webapp Example
 *
 * Copyright 2024 Modelon AB
 *
 * See LICENSE for terms
 */

import Plotly from "plotly.js-basic-dist-min";
import {
  Analysis,
  ExperimentDefinition,
  Model,
} from "@modelon/impact-client-js";
import createClient from "./utils/createClient";
import getQueryParameter from "./utils/getQueryParameter";
import "./style.css";
import isDev from "./utils/isDev";

const wsNameDev = "webappexample";

createClient().then((client) => {
  let variables = {};
  const modelName = "Examples.HeatingSystem";
  const workspaceId = isDev() ? wsNameDev : getQueryParameter("workspaceId");
  const myform = document.getElementById("myform");

  // hook up input change events to dispatch setParameter event
  myform.elements["height"].addEventListener("change", (event) => {
    variables["handle.height"] = event.target.value;
  });
  myform.elements["heightSlider"].addEventListener("change", (event) => {
    myform.elements["height"].value = event.target.value;
    variables["handle.height"] = event.target.value;
  });
  myform.elements["p_a_nominal"].addEventListener("change", (event) => {
    variables["pump.p_a_nominal"] = event.target.value;
  });

  // hook up simulation button to dispatch simulate event
  myform.elements["simulate"].addEventListener("click", async (event) => {
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

    const variableNames = [
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
      "radiator.port_b.p",
    ];

    const cases = await experiment.getTrajectories(variableNames);
    const trajectories = cases[0].items;

    const lastIndex = trajectories[0].trajectory.length - 1;

    const labels = ["tank", "pump", "heater", "pipe", "valve", "radiator"];

    function findIndex(entry) {
      let index = -1;
      variableNames.forEach((variableValue, variableIndex) => {
        if (variableValue === entry) {
          index = variableIndex;
        }
      });

      return index; // Return -1 if the entry is not found in the array
    }

    const values = [
      trajectories[findIndex("tank.ports[2].p")].trajectory[lastIndex] -
        trajectories[findIndex("tank.ports[1].p")].trajectory[lastIndex],
      trajectories[findIndex("pump.port_b.p")].trajectory[lastIndex] -
        trajectories[findIndex("pump.port_a.p")].trajectory[lastIndex],
      trajectories[findIndex("heater.port_b.p")].trajectory[lastIndex] -
        trajectories[findIndex("heater.port_a.p")].trajectory[lastIndex],
      trajectories[findIndex("pipe.port_b.p")].trajectory[lastIndex] -
        trajectories[findIndex("pipe.port_a.p")].trajectory[lastIndex],
      trajectories[findIndex("valve.port_b.p")].trajectory[lastIndex] -
        trajectories[findIndex("valve.port_a.p")].trajectory[lastIndex],
      trajectories[findIndex("radiator.port_b.p")].trajectory[lastIndex] -
        trajectories[findIndex("radiator.port_a.p")].trajectory[lastIndex],
    ];

    const y = values.reduce((acc, value, i) => [...acc, acc[i] + value], [0]);

    const colors = {
      positive: "rgba(55, 128, 191, 0.7)",
      negative: "rgba(219, 64, 82, 0.7)",
    };

    const data = [
      {
        x: labels,
        y: y,
        type: "bar",
        marker: {
          color: "rgba(1,1,1,0.0)",
        },
        hoverinfo: "none",
      },
      ...values.map((value, i) => ({
        x: labels,
        y: values.map((_, j) => (i === j ? value : 0)),
        type: "bar",
        marker: {
          color: value > 0 ? colors.positive : colors.negative,
        },
        hoverinfo: "none",
      })),
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
          color: "rgba(0, 0, 0, 1)",
        },
        showarrow: false,
        y: y[i] + value / 2,
      })),
    };

    Plotly.newPlot("plotlyContainer", data, layout, {
      displayModeBar: false,
    });
  });
});
