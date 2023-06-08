/**
 *  @References
 * [0] http://gruntjs.com/getting-started to install grunt-cli
 * [3]: http://gruntjs.com/configuring-tasks#files
 **/

const { env, browser, WEB_URL, OTHER_WEB_URLS } = require("../config/dist/config.build.json");
const { version } = require("./package.json");
const jsList = require("./jsList.json");
const isProductionBuildMode = process.env.BUILD_MODE === "production";

const generateUrlPattern = (urlString) => {
  try {
    const webUrlObj = new URL(urlString);
    return `${webUrlObj.protocol}//${webUrlObj.hostname}/*`;
  } catch (error) {
    console.error(`Invalid URL: ${urlString}`, error);
    return null;
  }
};

const processManifest = (content) => {
  const manifestJson = JSON.parse(content);

  manifestJson.version = version;

  const { content_scripts: contentScripts } = manifestJson;

  const webURLPatterns = [WEB_URL, ...OTHER_WEB_URLS].map(generateUrlPattern).filter((pattern) => !!pattern); // remove null entries

  contentScripts[0].matches = webURLPatterns;
  contentScripts[1].exclude_matches = webURLPatterns;

  if (env !== "prod") {
    manifestJson.description = `[${env.toUpperCase()}] ${manifestJson.description}`;
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
          "dist/generated/devtools/panel/panel.js": jsList["devtools-panel"],
          "dist/generated/background/background-bundled.js": jsList["background"],
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
          "dist/generated/background/background-bundled.js": ["dist/generated/background/background-bundled.js"],
          "dist/generated/pages/main.js": ["dist/generated/pages/main.js"],
          "dist/generated/client/client.js": ["dist/generated/client/client.js"],
        },
      },
    },

    /**
     * Task handlebars: Pre-Compile template files, concat them and save output to templates.hbs.js
     */
    handlebars: {
      compile: {
        options: {
          namespace: "RQ.Templates",
          partialsUseNamespace: true,
          processName: function (filePath) {
            var pieces = filePath.split("/"),
              fileName = pieces[pieces.length - 1];

            return fileName.replace(/(\.hbs)/gi, "");
          },
        },
        files: {
          "dist/generated/devtools/panel/templates.hbs.js": ["src/devtools/panel/templates/**/*.hbs"],
        },
      },
    },

    karma: {
      unit: {
        configFile: "karma.conf.js",
      },
    },

    watch: {
      templates: {
        files: ["**/*.hbs"],
        tasks: ["handlebars"],
      },
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
            src: "src/devtools/devtools.html",
            dest: "dist/generated/devtools/devtools.html",
          },
          {
            src: "src/devtools/bootstrap.js",
            dest: "dist/generated/devtools/bootstrap.js",
          },
          {
            src: "src/devtools/panel/panel.html",
            dest: "dist/generated/devtools/panel/panel.html",
          },
          {
            src: "src/devtools/panel/css/main.css",
            dest: "dist/generated/devtools/panel/panel.css",
          },
          // {
          //   src: "../common/dist/devtools/index.html",
          //   dest: "dist/generated/devtools/network-panel/index.html",
          // },
          // {
          //   src: "../common/dist/devtools/index.js",
          //   dest: "dist/generated/devtools/network-panel/index.js",
          // },
          // {
          //   src: "../common/dist/devtools/index.css",
          //   dest: "dist/generated/devtools/network-panel/index.css",
          // },
        ],
      },
    },
  });

  grunt.loadNpmTasks("grunt-contrib-handlebars");
  grunt.loadNpmTasks("grunt-contrib-concat");
  grunt.loadNpmTasks("grunt-karma");
  grunt.loadNpmTasks("grunt-contrib-watch");
  grunt.loadNpmTasks("grunt-contrib-copy");
  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("dist", ["handlebars", "concat", "copy:popup", "copy:devtools", "copy:static_content"]);

  grunt.registerTask("build", ["dist", `copy:manifest_${browser}`]);

  grunt.registerTask("test", ["dist", "karma:unit"]);
};
