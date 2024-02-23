window.DOM = [];
var mockElement = {};

RQ.ClientUtils = RQ.ClientUtils || {};

RQ.ClientUtils.executeJS = function (code) {
  window.DOM.push(code);
  return mockElement;
};

RQ.ClientUtils.addJSFromURL = function (src, _attr, callback) {
  window.DOM.push(src);
  if (typeof callback === "function") {
    callback();
  }
  return mockElement;
};

RQ.ClientUtils.embedCSS = function (css) {
  window.DOM.push(css);
  return mockElement;
};

RQ.ClientUtils.addCSSFromURL = function (src) {
  window.DOM.push(src);
  return mockElement;
};

RQ.ClientUtils.onPageLoad = function () {
  return new Promise(function (resolve) {
    setTimeout(resolve, 10);
  });
};
