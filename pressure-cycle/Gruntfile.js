const path = require("path");

module.exports = function(grunt) {
  grunt.initConfig({
    webpack: {
      myConfig: {
        mode: "development",
        entry: "./src/index.js",
        output: {
          filename: "main.js",
          path: path.resolve(__dirname, "dist")
        }
      }
    },

    copy: {
      all: {
        cwd: "src",
        src: ["**", "!**/*.js"],
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
        files: ["src/**", "!src/**/*.js"],
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
