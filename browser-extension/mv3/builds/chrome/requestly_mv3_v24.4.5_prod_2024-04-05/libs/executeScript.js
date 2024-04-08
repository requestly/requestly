!(function () {
  "use strict";
  const t = JSON.parse(document.currentScript.dataset.params),
    { code: c } = t;
  if (c) {
    new Function(c)();
  }
})();
