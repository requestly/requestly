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
    if (script.wrapperElement) {
      // todo: add this to ruleBuilder and schema
      const scriptBlock = RQ.ScriptRuleHandler.parseSpecificHTMLStringBlocks(script.wrapperElement, "script")[0];
      if (scriptBlock) {
        scriptBlock.attributes["src"] = script.value;
        scriptBlock.innerText = "";
        RQ.ScriptRuleHandler.embedBlocks("script", [scriptBlock]);
        return;
      }
    }

    RQ.ClientUtils.addRemoteJS(script.value, callback);
    return;
  }

  if (script.type === RQ.SCRIPT_TYPES.CODE) {
    const scriptBlocks = RQ.ScriptRuleHandler.parseSpecificHTMLStringBlocks(script.value, "script");
    if (!scriptBlocks || !scriptBlocks.length) {
      RQ.ClientUtils.executeJS(script.value);
    } else {
      scriptBlocks.forEach((scriptBlock) => {
        // \n is seen as a un recognised character in the script tag text
        scriptBlock.innerText = scriptBlock.innerText.replace(/\\n/g, "\n");
      });
      RQ.ScriptRuleHandler.embedScriptBlocks(scriptBlocks);
    }
  }
  typeof callback === "function" && callback();
};

RQ.ScriptRuleHandler.includeCSS = function (script, callback) {
  if (script.type === RQ.SCRIPT_TYPES.URL) {
    if (script.wrapperElement) {
      const styleLinkBlock = RQ.ScriptRuleHandler.parseSpecificHTMLStringBlocks(script.wrapperElement, "link")[0];
      if (styleLinkBlock) {
        styleLinkBlock.attributes["href"] = script.value;
        styleLinkBlock.innerText = "";
        RQ.ScriptRuleHandler.embedBlocks("link", [styleLinkBlock]);
        return;
      }
    }
    RQ.ClientUtils.addRemoteCSS(script.value);
  } else if (script.type === RQ.SCRIPT_TYPES.CODE) {
    const styleBlocks = RQ.ScriptRuleHandler.parseSpecificHTMLStringBlocks(script.value, "style");
    if (!styleBlocks || !styleBlocks.length) {
      RQ.ClientUtils.embedCSS(script.value);
    } else {
      RQ.ScriptRuleHandler.embedBlocks("style", styleBlocks);
    }
  }

  typeof callback === "function" && callback();
};

RQ.ScriptRuleHandler.parseSpecificHTMLStringBlocks = function (rawCode, htmlElementName) {
  if (!htmlElementName || htmlElementName === "body") throw new Error("htmlElementName is empty");
  const parser = new DOMParser();
  // if it is a normal code block, string will be added to body, hence not parsing body
  const doc = parser.parseFromString(rawCode, "text/html"); // this will take a lot of time....
  const blocks = Array.from(doc.getElementsByTagName(htmlElementName));
  const blockDetails = blocks.map((htmlBlock, index) => {
    return {
      index: index,
      innerText: htmlBlock.innerHTML.trim(),
      attributes: Array.from(htmlBlock.attributes).reduce((attrs, attr) => {
        attrs[attr.name] = attr.value ?? "";
        return attrs;
      }, {}),
    };
  });
  return blockDetails;
};

RQ.ScriptRuleHandler.embedBlocks = function (htmlElementName, blockDetails) {
  if (!htmlElementName || htmlElementName === "body") throw new Error("htmlElementName is empty");
  blockDetails.forEach((block) => {
    const htmlBlock = document.createElement(htmlElementName);
    htmlBlock.className = RQ.ClientUtils.getScriptClassAttribute();

    htmlBlock.appendChild(document.createTextNode(block.innerText));

    Object.keys(block.attributes).forEach((attr) => {
      htmlBlock.setAttribute(attr, block.attributes[attr]);
    });

    RQ.ScriptRuleHandler.appendToDom(htmlBlock);
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
