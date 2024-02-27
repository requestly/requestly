if (typeof isReactApp === "undefined") {
  var isReactApp = typeof require !== "undefined";
}

var Logger = {
  enabled: false,
  ns: "Requestly: ",

  log(...args) {
    if (this.enabled) {
      console.log(this.ns, ...args);
    }
  },

  error(...args) {
    if (this.enabled) {
      console.error(this.ns, ...args);
    }
  },
};

let urlParams = new URLSearchParams(window.location.search);
if (urlParams.has("debug")) {
  Logger.enabled = true;
}

window.rq_debug = () => (Logger.enabled = true);

try {
  Object.assign(window.RQ, window.RQ || {});
  Object.assign(window.RQ.components, window.RQ.components || {});
  Object.assign(window.RQ.components.logger, Logger);
} catch (_) {
  module.exports = Logger;
}
