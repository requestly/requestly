if (typeof isReactApp === "undefined") {
  var isReactApp = typeof require !== "undefined";
}

var Logger = {
  enabled: true,
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

if (isReactApp) {
  module.exports = Logger;
} else {
  window.RQ = window.RQ || {};
  window.RQ.components = window.RQ.components || {};
  window.RQ.components.logger = Logger;
}
