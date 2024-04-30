# 🚀 Welcome to an Impact Webapp Example!

This example illustrates how a web app could be implemented and developed for Modelon Impact.

## Setup

In order for the dev server etc. to work as intended, a few things are needed:

- Create a local .env file:
  - I.e. means creating a .env file with your personal info on similar format as in the .env.example file
- Create a workspace with this project loaded.
  - Make sure that the workspace id coincides with the id specified in the .env-file (`WORKSPACE_ID_DEV`)
- Install npm dependencies:
  - I.e. run `npm i` inside the pressure-cycle sub directory.

## Develop

You can run a development server to test your app using:

```sh
npm run dev
```

This works both when developing locally and developing on an impact server. If working locally, the Modelon Impact server at the specified `MODELON_IMPACT_CLIENT_URL` need to be started.

## Build

```sh
npm run build
```

This will build the app into the designated _CUSTOM_WEB_APPS_ folder for the project. After this is run, the app will be available from any workspace that has added this project.

## Info

This project has been created using **webpack-cli**.
