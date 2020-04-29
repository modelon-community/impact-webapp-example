# Pressure Cycle Example

## Synopsis

This is a simple example of how to work with the Modelon Impact Client for Javascript.

## Quickstart

(This assumes that you have a working node installation ready.)

Install dependencies:

    npm install

Build the project:

    npm run build

Start the auto rebuild when editing stuff under the `src`-directory:

    npm run watch

Start the development proxy (assuming a running a local installation of Impact):

    npm run proxy

You can set the proxy target by setting the `TARGET`-environment variable to the
URL of a running Impact instance, including port (i.e. "http://somehwere:4433").
You can also alter the port on which the proxy accepts connections by setting
the `PORT`-environment variable (the default is 3000).

Once the proxy is running, you can navigate to http://localhost:3000 (default) and
try out the webapp. Note that is may create a workspace called "undefined" unless you
specify a workspace in the code (please refer to the `impact-client` documentation
for details) or by entering http://localhost:3000/?workspaceId=your_workspace.

To clean up the project:

    npm run clean

## Project overview

The directory consists of the following:

    Gruntfile.js        Build-related stuff.
    LICENSE             BSD-3-Clause license.
    package.json        The package definition.
    package-lock.json   Locked versions of package.json.
    proxy.js            The development proxy.
    README.md           This readme.
    src                 Source files.

### Gruntfile.js

This is the configuration file of the task-runner Grunt, a node-equivalent of make.
It sets up a few tasks, such as how and what to build, what to watch for to trigger
automatic rebuilds, how to clean up built artifacts and such.

There are no support for modules in the browser, so for that we make use of Webpack,
a module bundler that traces the dependencies and bundle up everything into distributable
artifacts. This is good, since we can then make use of NPM to carry our dependencies.
(See the `package.json` section of `dependencies` for a list of dependencies of this
project.)

### LICENSE

This contains the license terms of the project.

### package.json

This is the NPM package definition of the project. It contains various details, such as
the name of the package, its version, scripts and dependencies. `devDependencies` state
what is needed to be able to run the proxy and various development tooling, whereas
`dependencies` state what is needed by the built artifact.

### package-lock.json

This is the lock-file of the package definition. It makes it possible to have reproducible
installs and should always be checked into SCM alongside `package.json`.

### proxy.js

This is the proxy needed for developing your webapps. For security reasons, we do not allow
API calls in a HTML-page from anywhere but the same domain. In this case, it would mean that
you would need to have Impact serve the webapps that you are developing. This is cumbersome,
so in order to make the life easier for the webapp developer, the proxy allows serving from
your project directory while proxying all calls that begin with `/api`.

### src

This directory contains the source and assets of your webapp.

### dist (not shown)

This directory contains the built artifacts and assets.

### node_modules (not shown)

This directory contains the dependencies stated in `package.json`.
