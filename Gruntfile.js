const path = require("path");

module.exports = function(grunt) {
  grunt.initConfig({
    webpack: {
      myConfig: {
        entry: {
          "pressure-cycle": "./src/pressure-cycle/index.js",
          "custom-function": "./src/custom-function/index.js",
          "multi-simulation": "./src/multi-simulation/index.js",
          simulation: "./src/simulation/index.js"
        },
        output: {
          filename: "[name]/main.js",
          path: path.resolve(__dirname, "dist")
        }
      }
    },

    copy: {
      all: {
        cwd: "src",
        src: ["**/*.html", "**/*.json"],
        dest: "dist",
        expand: true
      }
    },

    clean: ["dist"],

    watch: {
      js: {
        files: ["src/**/*.js"],
        tasks: ["webpack"]
      },
      copy: {
        files: ["src/**/*.html", "src/**/*.json"],
        tasks: ["copy"]
      }
    }
  });

  grunt.loadNpmTasks("grunt-webpack");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-clean");
  grunt.loadNpmTasks("grunt-contrib-watch");

  grunt.registerTask("build", ["webpack", "copy"]);

  grunt.registerTask("all", ["clean", "build"]);
  grunt.registerTask("default", ["all"]);
};
