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
if (urlParams.has("enableLogger")) {
  Logger.enabled = true;
}

window.RQ = window.RQ || {};
window.RQ.components = window.RQ.components || {};
if (window.RQ.components) window.RQ.components.logger = Logger;

if (isReactApp) {
  module.exports = Logger;
}
