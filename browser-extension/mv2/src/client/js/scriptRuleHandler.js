RQ.ScriptRuleHandler = {};

RQ.ScriptRuleHandler.setup = function () {
  const message = {
    action: RQ.CLIENT_MESSAGES.GET_SCRIPT_RULES,
    url: window.location.href,
  };
  chrome.runtime.sendMessage(message, function (rules) {
    if (rules && rules.constructor === Array) {
      RQ.ScriptRuleHandler.handleRules(rules);

      chrome.runtime.sendMessage({
        action: RQ.CLIENT_MESSAGES.NOTIFY_RULES_APPLIED,
        url: window.location.href,
        rules: rules,
        modification: "executed script",
        method: "GET",
        type: "document",
        timeStamp: Date.now(),
      });
    }
  });
};

RQ.ScriptRuleHandler.handleRules = function (rules) {
  return new Promise(function (resolve) {
    var libraries = [],
      scripts = [];

    rules.forEach(function (rule) {
      var pair = rule.pairs[0];

      pair.libraries &&
        pair.libraries.forEach(function (library) {
          if (!libraries.includes(library)) {
            libraries.push(library);
          }
        });

      scripts = scripts.concat(pair.scripts || []);
    });

    var cssScripts = scripts.filter(function (script) {
      return script.codeType === RQ.SCRIPT_CODE_TYPES.CSS;
    });

    var jsScripts = scripts.filter(function (script) {
      return !script.codeType || script.codeType === RQ.SCRIPT_CODE_TYPES.JS;
    });

    RQ.ScriptRuleHandler.handleCSSScripts(cssScripts)
      .then(function () {
        return RQ.ScriptRuleHandler.handleJSLibraries(libraries);
      })
      .then(function () {
        return RQ.ScriptRuleHandler.handleJSScripts(jsScripts);
      })
      .then(resolve);
  });
};

RQ.ScriptRuleHandler.handleCSSScripts = function (cssScripts) {
  return new Promise(function (resolve) {
    cssScripts.forEach(RQ.ScriptRuleHandler.includeCSS);
    resolve();
  });
};

RQ.ScriptRuleHandler.handleJSLibraries = function (libraries) {
  return new Promise(function (resolve) {
    RQ.ScriptRuleHandler.addLibraries(libraries, resolve);
  });
};

RQ.ScriptRuleHandler.handleJSScripts = function (jsScripts) {
  return new Promise(function (resolve) {
    var prePageLoadScripts = [],
      postPageLoadScripts = [];

    jsScripts.forEach(function (script) {
      if (script.loadTime === RQ.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD) {
        prePageLoadScripts.push(script);
      } else {
        postPageLoadScripts.push(script);
      }
    });

    RQ.ScriptRuleHandler.includeJSScriptsInOrder(prePageLoadScripts, function () {
      RQ.ClientUtils.onPageLoad().then(function () {
        RQ.ScriptRuleHandler.includeJSScriptsInOrder(postPageLoadScripts, resolve);
      });
    });
  });
};

RQ.ScriptRuleHandler.addLibraries = function (libraries, callback, index) {
  index = index || 0;

  if (index >= libraries.length) {
    typeof callback === "function" && callback();
    return;
  }

  var libraryKey = libraries[index],
    library = RQ.SCRIPT_LIBRARIES[libraryKey],
    addNextLibraries = function () {
      RQ.ScriptRuleHandler.addLibraries(libraries, callback, index + 1);
    };

  if (library) {
    RQ.ClientUtils.addRemoteJS(library.src, addNextLibraries);
  } else {
    addNextLibraries();
  }
};

RQ.ScriptRuleHandler.includeJSScriptsInOrder = function (scripts, callback, index) {
  index = index || 0;

  if (index >= scripts.length) {
    typeof callback === "function" && callback();
    return;
  }

  RQ.ScriptRuleHandler.includeJS(scripts[index], function () {
    RQ.ScriptRuleHandler.includeJSScriptsInOrder(scripts, callback, index + 1);
  });
};

RQ.ScriptRuleHandler.includeJS = function (script, callback) {
  if (!script.value) throw new Error("Script value is empty");
  if (script.type === RQ.SCRIPT_TYPES.URL) {
    if (script.attributes) {
      RQ.ScriptRuleHandler.addRemoteJSWithAttributes(script.value, script.attributes, callback);
    } else RQ.ClientUtils.addRemoteJS(script.value, callback);

    return;
  }

  if (script.type === RQ.SCRIPT_TYPES.CODE) {
    if (script.attributes) {
      RQ.ScriptRuleHandler.embedJSWithAttributes(script.value, script.attributes);
    } else RQ.ClientUtils.executeJS(script.value);
  }
  typeof callback === "function" && callback();
};

RQ.ScriptRuleHandler.includeCSS = function (script, callback) {
  if (script.type === RQ.SCRIPT_TYPES.URL) {
    if (script.attributes) {
      RQ.ScriptRuleHandler.addRemoteCSSWithAttributes(script.value, script.attributes, callback);
    } else RQ.ClientUtils.addRemoteCSS(script.value);

    return;
  }

  if (script.type === RQ.SCRIPT_TYPES.CODE) {
    if (script.attributes) {
      RQ.ScriptRuleHandler.embedCSSWithAttributes(script.value, script.attributes);
    } else {
      RQ.ClientUtils.embedCSS(script.value);
    }
  }
  typeof callback === "function" && callback();
};

RQ.ScriptRuleHandler.addRemoteJSWithAttributes = function (url, attributes, callback) {
  const script = document.createElement("script");
  attributes.forEach(({ name: attrName, value: attrVal }) => {
    script.setAttribute(attrName, attrVal ?? "");
  });
  script.src = url;

  script.classList.add(RQ.ClientUtils.getScriptClassAttribute());
  script.onload = callback;

  RQ.ScriptRuleHandler.appendToDom(script);
};

RQ.ScriptRuleHandler.embedJSWithAttributes = function (code, attributes) {
  const script = document.createElement("script");
  attributes.forEach(({ name: attrName, value: attrVal }) => {
    script.setAttribute(attrName, attrVal ?? "");
  });
  script.appendChild(document.createTextNode(code));

  script.classList.add(RQ.ClientUtils.getScriptClassAttribute());

  RQ.ScriptRuleHandler.appendToDom(script);
};

RQ.ScriptRuleHandler.addRemoteCSSWithAttributes = function (url, attributes, callback) {
  const link = document.createElement("link");
  attributes.forEach(({ name: attrName, value: attrVal }) => {
    link.setAttribute(attrName, attrVal ?? "");
  });
  link.href = url;

  link.classList.add(RQ.ClientUtils.getScriptClassAttribute());
  link.onload = callback;

  RQ.ScriptRuleHandler.appendToDom(link);
};

RQ.ScriptRuleHandler.embedCSSWithAttributes = function (code, attributes) {
  const style = document.createElement("style");
  style.className = RQ.ClientUtils.getScriptClassAttribute();
  attributes.forEach(({ name: attrName, value: attrVal }) => {
    style.setAttribute(attrName, attrVal ?? "");
  });
  style.appendChild(document.createTextNode(code));

  style.classList.add(RQ.ClientUtils.getScriptClassAttribute());

  RQ.ScriptRuleHandler.appendToDom(style);
};

RQ.ScriptRuleHandler.appendToDom = function (htmlNode) {
  const parent = document.head || document.documentElement;
  try {
    parent.appendChild(htmlNode);
  } catch (error) {
    console.error(error);
  }
};
