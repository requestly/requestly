if (typeof isReactApp === "undefined") {
  var isReactApp = typeof require !== "undefined";
}

var Logger = {
  enabled: false,
  ns: "Requestly: ",

  log: function (msg) {
    this.enabled &&
      console.log.apply(
        console,
        [this.ns].concat(Array.prototype.slice.call(arguments))
      );
  },

  error: function (msg) {
    this.enabled &&
      console.error.apply(
        console,
        [this.ns].concat(Array.prototype.slice.call(arguments))
      );
  },
};

if (isReactApp) {
  module.exports = Logger;
} else {
  window.RQ = window.RQ || {};
  window.RQ.components = window.RQ.components || {};
  window.RQ.components.logger = Logger;
}
