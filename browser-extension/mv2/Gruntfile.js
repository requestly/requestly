/**
 *  @References
 * [0] http://gruntjs.com/getting-started to install grunt-cli
 * [3]: http://gruntjs.com/configuring-tasks#files
 **/

const { env, browser, WEB_URL } = require("../config/dist/config.build.json");
const { version } = require("./package.json");
const jsList = require("./jsList.json");
const isProductionBuildMode = process.env.BUILD_MODE === "production";

const processManifest = (content) => {
  const manifestJson = JSON.parse(content);

  manifestJson.version = version;

  const contentScripts = manifestJson.content_scripts;
  const webUrl = new URL(WEB_URL);
  const webUrlPattern = `${webUrl.protocol}//${webUrl.hostname}/*`;
  contentScripts[0].matches = [webUrlPattern];
  contentScripts[1].exclude_matches = [webUrlPattern];

  if (env !== "prod") {
    manifestJson.description = `[${env.toUpperCase()}] ${
      manifestJson.description
    }`;
  }

  if (!isProductionBuildMode) {
    manifestJson.commands = {
      ...(manifestJson.commands || {}),
      reload: {
        description: "Reload extension in development mode",
        suggested_key: {
          default: "Alt+Shift+R",
        },
      },
    };
  }

  return JSON.stringify(manifestJson, null, 2);
};

module.exports = function (grunt) {
  grunt.initConfig({
    concat: {
      options: {
        separator: "\n",
      },
      dist: {
        files: {
          "dist/generated/shared.js": jsList["shared"],
          "dist/generated/pages/main.js": jsList["pages"],
          "dist/generated/client/client.js": jsList["client"],
          "dist/generated/background/background-bundled.js":
            jsList["background"],
        },
      },
    },

    uglify: {
      options: {
        compress: {
          drop_console: true,
        },
      },
      dist: {
        files: {
          "dist/generated/shared.js": ["dist/generated/shared.js"],
          "dist/generated/background/background-bundled.js": [
            "dist/generated/background/background-bundled.js",
          ],
          "dist/generated/pages/main.js": ["dist/generated/pages/main.js"],
          "dist/generated/client/client.js": [
            "dist/generated/client/client.js",
          ],
        },
      },
    },

    karma: {
      unit: {
        configFile: "karma.conf.js",
      },
    },

    watch: {
      scripts: {
        files: ["**/*.js"],
        tasks: ["concat"],
      },
      tests: {
        files: ["**/*.spec.js"],
        tasks: ["karma:unit"],
      },
    },

    copy: {
      manifest_firefox: {
        files: [
          {
            src: "manifest_firefox.json",
            dest: "dist/manifest.json",
          },
        ],
        options: {
          process: processManifest,
        },
      },
      manifest_chrome: {
        files: [
          {
            src: "manifest_chrome.json",
            dest: "dist/manifest.json",
          },
        ],
        options: {
          process: processManifest,
        },
      },
      manifest_edge: {
        files: [
          {
            src: "manifest_edge.json",
            dest: "dist/manifest.json",
          },
        ],
        options: {
          process: processManifest,
        },
      },
      static_content: {
        files: [
          { expand: true, src: ["resources/**"], dest: "dist/" },
          { expand: true, src: ["_locales/**"], dest: "dist/" },
          {
            src: "node_modules/@requestly/web-sdk/dist/requestly-web-sdk.js",
            dest: "dist/libs/requestly-web-sdk.js",
          },
        ],
      },
      popup: {
        files: [
          {
            cwd: "../common/dist/popup",
            src: "**/*",
            dest: "dist/popup",
            expand: true,
          },
        ],
      },
      devtools: {
        files: [
          {
            cwd: "../common/dist/devtools",
            src: "**/*",
            dest: "dist/devtools",
            expand: true,
          },
        ],
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("dist", [
    "concat",
    "copy:popup",
    "copy:devtools",
    "copy:static_content",
  ]);

  grunt.registerTask("build", ["dist", `copy:manifest_${browser}`]);

  grunt.registerTask("test", ["dist", "karma:unit"]);
};
