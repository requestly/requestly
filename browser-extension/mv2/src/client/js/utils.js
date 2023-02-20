RQ.ClientUtils = RQ.ClientUtils || {};

RQ.ClientUtils.executeJS = function (code, shouldRemove) {
  const script = document.createElement("script");
  script.type = "text/javascript";
  script.className = RQ.ClientUtils.getScriptClassAttribute();

  script.appendChild(document.createTextNode(code));
  const parent = document.head || document.documentElement;
  parent.appendChild(script);

  if (shouldRemove) {
    parent.removeChild(script);
  }
};

RQ.ClientUtils.addRemoteJS = function (src, callback) {
  var script = document.createElement("script");
  script.type = "text/javascript";
  script.src = src;
  script.className = RQ.ClientUtils.getScriptClassAttribute();

  if (typeof callback === "function") {
    script.onload = callback;
  }

  (document.head || document.documentElement).appendChild(script);
  return script;
};

RQ.ClientUtils.embedCSS = function (css) {
  var style = document.createElement("style");
  style.appendChild(document.createTextNode(css));
  style.className = RQ.ClientUtils.getScriptClassAttribute();

  (document.head || document.documentElement).appendChild(style);
  return style;
};

RQ.ClientUtils.addRemoteCSS = function (src) {
  var link = document.createElement("link");
  link.href = src;
  link.type = "text/css";
  link.rel = "stylesheet";
  link.className = RQ.ClientUtils.getScriptClassAttribute();

  (document.head || document.documentElement).appendChild(link);
  return link;
};

RQ.ClientUtils.onPageLoad = function () {
  return new Promise(function (resolve) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", resolve);
    } else {
      resolve();
    }
  });
};

RQ.ClientUtils.getScriptClassAttribute = function () {
  return RQ.PUBLIC_NAMESPACE + "SCRIPT";
};

RQ.ClientUtils.isHTMLDocument = function () {
  const docType = document.doctype;
  return docType && docType.name === "html";
};
