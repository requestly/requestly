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
  // todo: handle attributes here too
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
    // todo: add attributes here
    RQ.ClientUtils.addRemoteJS(script.value, callback);
    return;
  }

  if (script.type === RQ.SCRIPT_TYPES.CODE) {
    const scriptBlocks = RQ.ScriptRuleHandler.parseScriptCodeBlocks(script.value);
    if (!scriptBlocks || !scriptBlocks.length) {
      RQ.ClientUtils.executeJS(script.value);
    } else {
      RQ.ScriptRuleHandler.embedScriptBlocks(scriptBlocks);
    }
  }
  typeof callback === "function" && callback();
};

RQ.ScriptRuleHandler.parseScriptCodeBlocks = function (rawCode) {
  const parser = new DOMParser();
  // if it is a normal code block, string will be added to body
  const doc = parser.parseFromString(rawCode, "text/html"); // this will take a lot of time....
  const scripts = Array.from(doc.getElementsByTagName("script"));
  const scriptDetails = scripts.map((script, index) => {
    return {
      index: index,
      code: script.innerHTML.trim(),
      attributes: Array.from(script.attributes).reduce((attrs, attr) => {
        // todo: remove src attribute in case of inline script
        attrs[attr.name] = attr.value ?? "";
        return attrs;
      }, {}),
    };
  });
  return scriptDetails;
};

RQ.ScriptRuleHandler.embedScriptBlocks = function (scriptDetails) {
  scriptDetails.forEach((scriptObj) => {
    const script = document.createElement("script");
    script.type = "text/javascript";
    script.className = RQ.ClientUtils.getScriptClassAttribute();
    // \n is seen as a un recognised character in the script tag text
    const code = scriptObj.code.replace(/\n/g, "\\n");
    script.appendChild(document.createTextNode(code));
    Object.keys(scriptObj.attributes).forEach((attr) => {
      script.setAttribute(attr, scriptObj.attributes[attr]);
    });

    RQ.ScriptRuleHandler.appendToDom(script);
  });
};

RQ.ScriptRuleHandler.includeCSS = function (script, callback) {
  if (script.type === RQ.SCRIPT_TYPES.URL) {
    // todo: add attributes here
    RQ.ClientUtils.addRemoteCSS(script.value);
  } else if (script.type === RQ.SCRIPT_TYPES.CODE) {
    const styleBlocks = RQ.ScriptRuleHandler.parseStyleBlocks(script.value);
    if (!styleBlocks || !styleBlocks.length) {
      RQ.ClientUtils.embedCSS(script.value);
    } else {
      RQ.ScriptRuleHandler.embedScriptBlocks(styleBlocks);
    }
  }

  typeof callback === "function" && callback();
};

RQ.ScriptRuleHandler.parseStyleBlocks = function (rawCode) {
  const parser = new DOMParser();
  // if it is a normal code block, string will be added to body
  const doc = parser.parseFromString(rawCode, "text/html"); // this will take a lot of time....
  const styles = Array.from(doc.getElementsByTagName("style"));
  const styleDetails = styles.map((style, index) => {
    return {
      index: index,
      code: style.innerHTML.trim(),
      attributes: Array.from(style.attributes).reduce((attrs, attr) => {
        // todo: remove src attribute in case of inline script
        attrs[attr.name] = attr.value ?? "";
        return attrs;
      }, {}),
    };
  });
  return styleDetails;
};

RQ.ScriptRuleHandler.embedStyleBlocks = function (styleDetails) {
  styleDetails.forEach((styleObj) => {
    const style = document.createElement("style");
    style.className = `RQ.ClientUtils.getScriptClassAttribute();`;

    style.appendChild(document.createTextNode(styleObj.code));

    Object.keys(styleObj.attributes).forEach((attr) => {
      style.setAttribute(attr, styleObj.attributes[attr]);
    });

    RQ.ScriptRuleHandler.appendToDom(style);
  });
};

RQ.ScriptRuleHandler.appendToDom = function (htmlNode) {
  const parent = document.head || document.documentElement;
  try {
    parent.appendChild(htmlNode);
  } catch (error) {
    console.error(error);
  }
};
