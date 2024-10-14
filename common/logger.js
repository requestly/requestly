if (typeof isReactApp === "undefined") {
  var isReactApp = document?.getElementById("root") !== null;
}

var Logger = {
  enabled: false,
  ns: "Requestly: ",

  log(...args) {
    if (this?.enabled) {
      console.log(this.ns, ...args);
    }
  },

  error(...args) {
    if (this?.enabled) {
      console.error(this.ns, ...args);
    }
  },

  time(...args) {
    if (this?.enabled) {
      console.time(...args);
    }
  },

  timeEnd(...args) {
    if (this?.enabled) {
      console.timeEnd(...args);
    }
  },

  timeLog(...args) {
    if (this?.enabled) {
      console.timeLog(...args);
    }
  },
};

let urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("debug")) {
  Logger.enabled = true;
}

window.rq_debug = () => (Logger.enabled = true);

export default Logger;
if (!isReactApp) {
  window.RQ = window.RQ || {};
  window.RQ.components = window.RQ.components || {};
  window.RQ.components.logger = Logger;
}
