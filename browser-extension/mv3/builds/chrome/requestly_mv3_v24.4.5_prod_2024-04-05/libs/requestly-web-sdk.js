/*
 * Copyright (c) 2021-present RQ Labs Inc.
 * This source code is licensed under the "GNU AGPLv3" license.
 */

var Requestly = (function (exports) {
  "use strict";

  var NodeType;
  (function (NodeType) {
    NodeType[(NodeType["Document"] = 0)] = "Document";
    NodeType[(NodeType["DocumentType"] = 1)] = "DocumentType";
    NodeType[(NodeType["Element"] = 2)] = "Element";
    NodeType[(NodeType["Text"] = 3)] = "Text";
    NodeType[(NodeType["CDATA"] = 4)] = "CDATA";
    NodeType[(NodeType["Comment"] = 5)] = "Comment";
  })(NodeType || (NodeType = {}));

  function isElement(n) {
    return n.nodeType === n.ELEMENT_NODE;
  }
  function isShadowRoot(n) {
    const host = n === null || n === void 0 ? void 0 : n.host;
    return Boolean((host === null || host === void 0 ? void 0 : host.shadowRoot) === n);
  }
  function isNativeShadowDom(shadowRoot) {
    return Object.prototype.toString.call(shadowRoot) === "[object ShadowRoot]";
  }
  function fixBrowserCompatibilityIssuesInCSS(cssText) {
    if (cssText.includes(" background-clip: text;") && !cssText.includes(" -webkit-background-clip: text;")) {
      cssText = cssText.replace(" background-clip: text;", " -webkit-background-clip: text; background-clip: text;");
    }
    return cssText;
  }
  function escapeImportStatement(rule) {
    const { cssText } = rule;
    if (cssText.split('"').length < 3) return cssText;
    const statement = ["@import", `url(${JSON.stringify(rule.href)})`];
    if (rule.layerName === "") {
      statement.push(`layer`);
    } else if (rule.layerName) {
      statement.push(`layer(${rule.layerName})`);
    }
    if (rule.supportsText) {
      statement.push(`supports(${rule.supportsText})`);
    }
    if (rule.media.length) {
      statement.push(rule.media.mediaText);
    }
    return statement.join(" ") + ";";
  }
  function stringifyStylesheet(s) {
    try {
      const rules = s.rules || s.cssRules;
      return rules ? fixBrowserCompatibilityIssuesInCSS(Array.from(rules).map(stringifyRule).join("")) : null;
    } catch (error) {
      return null;
    }
  }
  function stringifyRule(rule) {
    let importStringified;
    if (isCSSImportRule(rule)) {
      try {
        importStringified = stringifyStylesheet(rule.styleSheet) || escapeImportStatement(rule);
      } catch (error) {}
    }
    return validateStringifiedCssRule(importStringified || rule.cssText);
  }
  function validateStringifiedCssRule(cssStringified) {
    if (cssStringified.includes(":")) {
      const regex = /(\[(?:[\w-]+)[^\\])(:(?:[\w-]+)\])/gm;
      return cssStringified.replace(regex, "$1\\$2");
    }
    return cssStringified;
  }
  function isCSSImportRule(rule) {
    return "styleSheet" in rule;
  }
  class Mirror {
    constructor() {
      this.idNodeMap = new Map();
      this.nodeMetaMap = new WeakMap();
    }
    getId(n) {
      var _a;
      if (!n) return -1;
      const id = (_a = this.getMeta(n)) === null || _a === void 0 ? void 0 : _a.id;
      return id !== null && id !== void 0 ? id : -1;
    }
    getNode(id) {
      return this.idNodeMap.get(id) || null;
    }
    getIds() {
      return Array.from(this.idNodeMap.keys());
    }
    getMeta(n) {
      return this.nodeMetaMap.get(n) || null;
    }
    removeNodeFromMap(n) {
      const id = this.getId(n);
      this.idNodeMap.delete(id);
      if (n.childNodes) {
        n.childNodes.forEach((childNode) => this.removeNodeFromMap(childNode));
      }
    }
    has(id) {
      return this.idNodeMap.has(id);
    }
    hasNode(node) {
      return this.nodeMetaMap.has(node);
    }
    add(n, meta) {
      const id = meta.id;
      this.idNodeMap.set(id, n);
      this.nodeMetaMap.set(n, meta);
    }
    replace(id, n) {
      const oldNode = this.getNode(id);
      if (oldNode) {
        const meta = this.nodeMetaMap.get(oldNode);
        if (meta) this.nodeMetaMap.set(n, meta);
      }
      this.idNodeMap.set(id, n);
    }
    reset() {
      this.idNodeMap = new Map();
      this.nodeMetaMap = new WeakMap();
    }
  }
  function createMirror() {
    return new Mirror();
  }
  function maskInputValue({ element, maskInputOptions, tagName, type, value, maskInputFn }) {
    let text = value || "";
    const actualType = type && toLowerCase(type);
    if (maskInputOptions[tagName.toLowerCase()] || (actualType && maskInputOptions[actualType])) {
      if (maskInputFn) {
        text = maskInputFn(text, element);
      } else {
        text = "*".repeat(text.length);
      }
    }
    return text;
  }
  function toLowerCase(str) {
    return str.toLowerCase();
  }
  const ORIGINAL_ATTRIBUTE_NAME = "__rrweb_original__";
  function is2DCanvasBlank(canvas) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return true;
    const chunkSize = 50;
    for (let x = 0; x < canvas.width; x += chunkSize) {
      for (let y = 0; y < canvas.height; y += chunkSize) {
        const getImageData = ctx.getImageData;
        const originalGetImageData =
          ORIGINAL_ATTRIBUTE_NAME in getImageData ? getImageData[ORIGINAL_ATTRIBUTE_NAME] : getImageData;
        const pixelBuffer = new Uint32Array(
          originalGetImageData.call(
            ctx,
            x,
            y,
            Math.min(chunkSize, canvas.width - x),
            Math.min(chunkSize, canvas.height - y)
          ).data.buffer
        );
        if (pixelBuffer.some((pixel) => pixel !== 0)) return false;
      }
    }
    return true;
  }
  function getInputType(element) {
    const type = element.type;
    return element.hasAttribute("data-rr-is-password") ? "password" : type ? toLowerCase(type) : null;
  }

  let _id = 1;
  const tagNameRegex = new RegExp("[^a-z0-9-_:]");
  const IGNORED_NODE = -2;
  function genId() {
    return _id++;
  }
  function getValidTagName(element) {
    if (element instanceof HTMLFormElement) {
      return "form";
    }
    const processedTagName = toLowerCase(element.tagName);
    if (tagNameRegex.test(processedTagName)) {
      return "div";
    }
    return processedTagName;
  }
  function extractOrigin(url) {
    let origin = "";
    if (url.indexOf("//") > -1) {
      origin = url.split("/").slice(0, 3).join("/");
    } else {
      origin = url.split("/")[0];
    }
    origin = origin.split("?")[0];
    return origin;
  }
  let canvasService;
  let canvasCtx;
  const URL_IN_CSS_REF = /url\((?:(')([^']*)'|(")(.*?)"|([^)]*))\)/gm;
  const URL_PROTOCOL_MATCH = /^(?:[a-z+]+:)?\/\//i;
  const URL_WWW_MATCH = /^www\..*/i;
  const DATA_URI = /^(data:)([^,]*),(.*)/i;
  function absoluteToStylesheet(cssText, href) {
    return (cssText || "").replace(URL_IN_CSS_REF, (origin, quote1, path1, quote2, path2, path3) => {
      const filePath = path1 || path2 || path3;
      const maybeQuote = quote1 || quote2 || "";
      if (!filePath) {
        return origin;
      }
      if (URL_PROTOCOL_MATCH.test(filePath) || URL_WWW_MATCH.test(filePath)) {
        return `url(${maybeQuote}${filePath}${maybeQuote})`;
      }
      if (DATA_URI.test(filePath)) {
        return `url(${maybeQuote}${filePath}${maybeQuote})`;
      }
      if (filePath[0] === "/") {
        return `url(${maybeQuote}${extractOrigin(href) + filePath}${maybeQuote})`;
      }
      const stack = href.split("/");
      const parts = filePath.split("/");
      stack.pop();
      for (const part of parts) {
        if (part === ".") {
          continue;
        } else if (part === "..") {
          stack.pop();
        } else {
          stack.push(part);
        }
      }
      return `url(${maybeQuote}${stack.join("/")}${maybeQuote})`;
    });
  }
  const SRCSET_NOT_SPACES = /^[^ \t\n\r\u000c]+/;
  const SRCSET_COMMAS_OR_SPACES = /^[, \t\n\r\u000c]+/;
  function getAbsoluteSrcsetString(doc, attributeValue) {
    if (attributeValue.trim() === "") {
      return attributeValue;
    }
    let pos = 0;
    function collectCharacters(regEx) {
      let chars;
      const match = regEx.exec(attributeValue.substring(pos));
      if (match) {
        chars = match[0];
        pos += chars.length;
        return chars;
      }
      return "";
    }
    const output = [];
    while (true) {
      collectCharacters(SRCSET_COMMAS_OR_SPACES);
      if (pos >= attributeValue.length) {
        break;
      }
      let url = collectCharacters(SRCSET_NOT_SPACES);
      if (url.slice(-1) === ",") {
        url = absoluteToDoc(doc, url.substring(0, url.length - 1));
        output.push(url);
      } else {
        let descriptorsStr = "";
        url = absoluteToDoc(doc, url);
        let inParens = false;
        while (true) {
          const c = attributeValue.charAt(pos);
          if (c === "") {
            output.push((url + descriptorsStr).trim());
            break;
          } else if (!inParens) {
            if (c === ",") {
              pos += 1;
              output.push((url + descriptorsStr).trim());
              break;
            } else if (c === "(") {
              inParens = true;
            }
          } else {
            if (c === ")") {
              inParens = false;
            }
          }
          descriptorsStr += c;
          pos += 1;
        }
      }
    }
    return output.join(", ");
  }
  function absoluteToDoc(doc, attributeValue) {
    if (!attributeValue || attributeValue.trim() === "") {
      return attributeValue;
    }
    const a = doc.createElement("a");
    a.href = attributeValue;
    return a.href;
  }
  function isSVGElement(el) {
    return Boolean(el.tagName === "svg" || el.ownerSVGElement);
  }
  function getHref() {
    const a = document.createElement("a");
    a.href = "";
    return a.href;
  }
  function transformAttribute(doc, tagName, name, value) {
    if (!value) {
      return value;
    }
    if (name === "src" || (name === "href" && !(tagName === "use" && value[0] === "#"))) {
      return absoluteToDoc(doc, value);
    } else if (name === "xlink:href" && value[0] !== "#") {
      return absoluteToDoc(doc, value);
    } else if (name === "background" && (tagName === "table" || tagName === "td" || tagName === "th")) {
      return absoluteToDoc(doc, value);
    } else if (name === "srcset") {
      return getAbsoluteSrcsetString(doc, value);
    } else if (name === "style") {
      return absoluteToStylesheet(value, getHref());
    } else if (tagName === "object" && name === "data") {
      return absoluteToDoc(doc, value);
    }
    return value;
  }
  function ignoreAttribute(tagName, name, _value) {
    return (tagName === "video" || tagName === "audio") && name === "autoplay";
  }
  function _isBlockedElement(element, blockClass, blockSelector) {
    try {
      if (typeof blockClass === "string") {
        if (element.classList.contains(blockClass)) {
          return true;
        }
      } else {
        for (let eIndex = element.classList.length; eIndex--; ) {
          const className = element.classList[eIndex];
          if (blockClass.test(className)) {
            return true;
          }
        }
      }
      if (blockSelector) {
        return element.matches(blockSelector);
      }
    } catch (e) {}
    return false;
  }
  function classMatchesRegex(node, regex, checkAncestors) {
    if (!node) return false;
    if (node.nodeType !== node.ELEMENT_NODE) {
      if (!checkAncestors) return false;
      return classMatchesRegex(node.parentNode, regex, checkAncestors);
    }
    for (let eIndex = node.classList.length; eIndex--; ) {
      const className = node.classList[eIndex];
      if (regex.test(className)) {
        return true;
      }
    }
    if (!checkAncestors) return false;
    return classMatchesRegex(node.parentNode, regex, checkAncestors);
  }
  function needMaskingText(node, maskTextClass, maskTextSelector) {
    try {
      const el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
      if (el === null) return false;
      if (typeof maskTextClass === "string") {
        if (el.classList.contains(maskTextClass)) return true;
        if (el.closest(`.${maskTextClass}`)) return true;
      } else {
        if (classMatchesRegex(el, maskTextClass, true)) return true;
      }
      if (maskTextSelector) {
        if (el.matches(maskTextSelector)) return true;
        if (el.closest(maskTextSelector)) return true;
      }
    } catch (e) {}
    return false;
  }
  function onceIframeLoaded(iframeEl, listener, iframeLoadTimeout) {
    const win = iframeEl.contentWindow;
    if (!win) {
      return;
    }
    let fired = false;
    let readyState;
    try {
      readyState = win.document.readyState;
    } catch (error) {
      return;
    }
    if (readyState !== "complete") {
      const timer = setTimeout(() => {
        if (!fired) {
          listener();
          fired = true;
        }
      }, iframeLoadTimeout);
      iframeEl.addEventListener("load", () => {
        clearTimeout(timer);
        fired = true;
        listener();
      });
      return;
    }
    const blankUrl = "about:blank";
    if (win.location.href !== blankUrl || iframeEl.src === blankUrl || iframeEl.src === "") {
      setTimeout(listener, 0);
      return iframeEl.addEventListener("load", listener);
    }
    iframeEl.addEventListener("load", listener);
  }
  function onceStylesheetLoaded(link, listener, styleSheetLoadTimeout) {
    let fired = false;
    let styleSheetLoaded;
    try {
      styleSheetLoaded = link.sheet;
    } catch (error) {
      return;
    }
    if (styleSheetLoaded) return;
    const timer = setTimeout(() => {
      if (!fired) {
        listener();
        fired = true;
      }
    }, styleSheetLoadTimeout);
    link.addEventListener("load", () => {
      clearTimeout(timer);
      fired = true;
      listener();
    });
  }
  function serializeNode(n, options) {
    const {
      doc,
      mirror,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      inlineStylesheet,
      maskInputOptions = {},
      maskTextFn,
      maskInputFn,
      dataURLOptions = {},
      inlineImages,
      recordCanvas,
      keepIframeSrcFn,
      newlyAddedElement = false,
    } = options;
    const rootId = getRootId(doc, mirror);
    switch (n.nodeType) {
      case n.DOCUMENT_NODE:
        if (n.compatMode !== "CSS1Compat") {
          return {
            type: NodeType.Document,
            childNodes: [],
            compatMode: n.compatMode,
          };
        } else {
          return {
            type: NodeType.Document,
            childNodes: [],
          };
        }
      case n.DOCUMENT_TYPE_NODE:
        return {
          type: NodeType.DocumentType,
          name: n.name,
          publicId: n.publicId,
          systemId: n.systemId,
          rootId,
        };
      case n.ELEMENT_NODE:
        return serializeElementNode(n, {
          doc,
          blockClass,
          blockSelector,
          inlineStylesheet,
          maskInputOptions,
          maskInputFn,
          dataURLOptions,
          inlineImages,
          recordCanvas,
          keepIframeSrcFn,
          newlyAddedElement,
          rootId,
        });
      case n.TEXT_NODE:
        return serializeTextNode(n, {
          maskTextClass,
          maskTextSelector,
          maskTextFn,
          rootId,
        });
      case n.CDATA_SECTION_NODE:
        return {
          type: NodeType.CDATA,
          textContent: "",
          rootId,
        };
      case n.COMMENT_NODE:
        return {
          type: NodeType.Comment,
          textContent: n.textContent || "",
          rootId,
        };
      default:
        return false;
    }
  }
  function getRootId(doc, mirror) {
    if (!mirror.hasNode(doc)) return undefined;
    const docId = mirror.getId(doc);
    return docId === 1 ? undefined : docId;
  }
  function serializeTextNode(n, options) {
    var _a;
    const { maskTextClass, maskTextSelector, maskTextFn, rootId } = options;
    const parentTagName = n.parentNode && n.parentNode.tagName;
    let textContent = n.textContent;
    const isStyle = parentTagName === "STYLE" ? true : undefined;
    const isScript = parentTagName === "SCRIPT" ? true : undefined;
    if (isStyle && textContent) {
      try {
        if (n.nextSibling || n.previousSibling) {
        } else if ((_a = n.parentNode.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) {
          textContent = stringifyStylesheet(n.parentNode.sheet);
        }
      } catch (err) {
        console.warn(`Cannot get CSS styles from text's parentNode. Error: ${err}`, n);
      }
      textContent = absoluteToStylesheet(textContent, getHref());
    }
    if (isScript) {
      textContent = "SCRIPT_PLACEHOLDER";
    }
    if (!isStyle && !isScript && textContent && needMaskingText(n, maskTextClass, maskTextSelector)) {
      textContent = maskTextFn ? maskTextFn(textContent) : textContent.replace(/[\S]/g, "*");
    }
    return {
      type: NodeType.Text,
      textContent: textContent || "",
      isStyle,
      rootId,
    };
  }
  function serializeElementNode(n, options) {
    const {
      doc,
      blockClass,
      blockSelector,
      inlineStylesheet,
      maskInputOptions = {},
      maskInputFn,
      dataURLOptions = {},
      inlineImages,
      recordCanvas,
      keepIframeSrcFn,
      newlyAddedElement = false,
      rootId,
    } = options;
    const needBlock = _isBlockedElement(n, blockClass, blockSelector);
    const tagName = getValidTagName(n);
    let attributes = {};
    const len = n.attributes.length;
    for (let i = 0; i < len; i++) {
      const attr = n.attributes[i];
      if (!ignoreAttribute(tagName, attr.name, attr.value)) {
        attributes[attr.name] = transformAttribute(doc, tagName, toLowerCase(attr.name), attr.value);
      }
    }
    if (tagName === "link" && inlineStylesheet) {
      const stylesheet = Array.from(doc.styleSheets).find((s) => {
        return s.href === n.href;
      });
      let cssText = null;
      if (stylesheet) {
        cssText = stringifyStylesheet(stylesheet);
      }
      if (cssText) {
        delete attributes.rel;
        delete attributes.href;
        attributes._cssText = absoluteToStylesheet(cssText, stylesheet.href);
      }
    }
    if (tagName === "style" && n.sheet && !(n.innerText || n.textContent || "").trim().length) {
      const cssText = stringifyStylesheet(n.sheet);
      if (cssText) {
        attributes._cssText = absoluteToStylesheet(cssText, getHref());
      }
    }
    if (tagName === "input" || tagName === "textarea" || tagName === "select") {
      const value = n.value;
      const checked = n.checked;
      if (
        attributes.type !== "radio" &&
        attributes.type !== "checkbox" &&
        attributes.type !== "submit" &&
        attributes.type !== "button" &&
        value
      ) {
        const type = getInputType(n);
        attributes.value = maskInputValue({
          element: n,
          type,
          tagName,
          value,
          maskInputOptions,
          maskInputFn,
        });
      } else if (checked) {
        attributes.checked = checked;
      }
    }
    if (tagName === "option") {
      if (n.selected && !maskInputOptions["select"]) {
        attributes.selected = true;
      } else {
        delete attributes.selected;
      }
    }
    if (tagName === "canvas" && recordCanvas) {
      if (n.__context === "2d") {
        if (!is2DCanvasBlank(n)) {
          attributes.rr_dataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        }
      } else if (!("__context" in n)) {
        const canvasDataURL = n.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        const blankCanvas = document.createElement("canvas");
        blankCanvas.width = n.width;
        blankCanvas.height = n.height;
        const blankCanvasDataURL = blankCanvas.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        if (canvasDataURL !== blankCanvasDataURL) {
          attributes.rr_dataURL = canvasDataURL;
        }
      }
    }
    if (tagName === "img" && inlineImages) {
      if (!canvasService) {
        canvasService = doc.createElement("canvas");
        canvasCtx = canvasService.getContext("2d");
      }
      const image = n;
      const oldValue = image.crossOrigin;
      image.crossOrigin = "anonymous";
      const recordInlineImage = () => {
        image.removeEventListener("load", recordInlineImage);
        try {
          canvasService.width = image.naturalWidth;
          canvasService.height = image.naturalHeight;
          canvasCtx.drawImage(image, 0, 0);
          attributes.rr_dataURL = canvasService.toDataURL(dataURLOptions.type, dataURLOptions.quality);
        } catch (err) {
          console.warn(`Cannot inline img src=${image.currentSrc}! Error: ${err}`);
        }
        oldValue ? (attributes.crossOrigin = oldValue) : image.removeAttribute("crossorigin");
      };
      if (image.complete && image.naturalWidth !== 0) recordInlineImage();
      else image.addEventListener("load", recordInlineImage);
    }
    if (tagName === "audio" || tagName === "video") {
      attributes.rr_mediaState = n.paused ? "paused" : "played";
      attributes.rr_mediaCurrentTime = n.currentTime;
    }
    if (!newlyAddedElement) {
      if (n.scrollLeft) {
        attributes.rr_scrollLeft = n.scrollLeft;
      }
      if (n.scrollTop) {
        attributes.rr_scrollTop = n.scrollTop;
      }
    }
    if (needBlock) {
      const { width, height } = n.getBoundingClientRect();
      attributes = {
        class: attributes.class,
        rr_width: `${width}px`,
        rr_height: `${height}px`,
      };
    }
    if (tagName === "iframe" && !keepIframeSrcFn(attributes.src)) {
      if (!n.contentDocument) {
        attributes.rr_src = attributes.src;
      }
      delete attributes.src;
    }
    let isCustomElement;
    try {
      if (customElements.get(tagName)) isCustomElement = true;
    } catch (e) {}
    return {
      type: NodeType.Element,
      tagName,
      attributes,
      childNodes: [],
      isSVG: isSVGElement(n) || undefined,
      needBlock,
      rootId,
      isCustom: isCustomElement,
    };
  }
  function lowerIfExists(maybeAttr) {
    if (maybeAttr === undefined || maybeAttr === null) {
      return "";
    } else {
      return maybeAttr.toLowerCase();
    }
  }
  function slimDOMExcluded(sn, slimDOMOptions) {
    if (slimDOMOptions.comment && sn.type === NodeType.Comment) {
      return true;
    } else if (sn.type === NodeType.Element) {
      if (
        slimDOMOptions.script &&
        (sn.tagName === "script" ||
          (sn.tagName === "link" &&
            (sn.attributes.rel === "preload" || sn.attributes.rel === "modulepreload") &&
            sn.attributes.as === "script") ||
          (sn.tagName === "link" &&
            sn.attributes.rel === "prefetch" &&
            typeof sn.attributes.href === "string" &&
            sn.attributes.href.endsWith(".js")))
      ) {
        return true;
      } else if (
        slimDOMOptions.headFavicon &&
        ((sn.tagName === "link" && sn.attributes.rel === "shortcut icon") ||
          (sn.tagName === "meta" &&
            (lowerIfExists(sn.attributes.name).match(/^msapplication-tile(image|color)$/) ||
              lowerIfExists(sn.attributes.name) === "application-name" ||
              lowerIfExists(sn.attributes.rel) === "icon" ||
              lowerIfExists(sn.attributes.rel) === "apple-touch-icon" ||
              lowerIfExists(sn.attributes.rel) === "shortcut icon")))
      ) {
        return true;
      } else if (sn.tagName === "meta") {
        if (slimDOMOptions.headMetaDescKeywords && lowerIfExists(sn.attributes.name).match(/^description|keywords$/)) {
          return true;
        } else if (
          slimDOMOptions.headMetaSocial &&
          (lowerIfExists(sn.attributes.property).match(/^(og|twitter|fb):/) ||
            lowerIfExists(sn.attributes.name).match(/^(og|twitter):/) ||
            lowerIfExists(sn.attributes.name) === "pinterest")
        ) {
          return true;
        } else if (
          slimDOMOptions.headMetaRobots &&
          (lowerIfExists(sn.attributes.name) === "robots" ||
            lowerIfExists(sn.attributes.name) === "googlebot" ||
            lowerIfExists(sn.attributes.name) === "bingbot")
        ) {
          return true;
        } else if (slimDOMOptions.headMetaHttpEquiv && sn.attributes["http-equiv"] !== undefined) {
          return true;
        } else if (
          slimDOMOptions.headMetaAuthorship &&
          (lowerIfExists(sn.attributes.name) === "author" ||
            lowerIfExists(sn.attributes.name) === "generator" ||
            lowerIfExists(sn.attributes.name) === "framework" ||
            lowerIfExists(sn.attributes.name) === "publisher" ||
            lowerIfExists(sn.attributes.name) === "progid" ||
            lowerIfExists(sn.attributes.property).match(/^article:/) ||
            lowerIfExists(sn.attributes.property).match(/^product:/))
        ) {
          return true;
        } else if (
          slimDOMOptions.headMetaVerification &&
          (lowerIfExists(sn.attributes.name) === "google-site-verification" ||
            lowerIfExists(sn.attributes.name) === "yandex-verification" ||
            lowerIfExists(sn.attributes.name) === "csrf-token" ||
            lowerIfExists(sn.attributes.name) === "p:domain_verify" ||
            lowerIfExists(sn.attributes.name) === "verify-v1" ||
            lowerIfExists(sn.attributes.name) === "verification" ||
            lowerIfExists(sn.attributes.name) === "shopify-checkout-api-token")
        ) {
          return true;
        }
      }
    }
    return false;
  }
  function serializeNodeWithId(n, options) {
    const {
      doc,
      mirror,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      skipChild = false,
      inlineStylesheet = true,
      maskInputOptions = {},
      maskTextFn,
      maskInputFn,
      slimDOMOptions,
      dataURLOptions = {},
      inlineImages = false,
      recordCanvas = false,
      onSerialize,
      onIframeLoad,
      iframeLoadTimeout = 5000,
      onStylesheetLoad,
      stylesheetLoadTimeout = 5000,
      keepIframeSrcFn = () => false,
      newlyAddedElement = false,
    } = options;
    let { preserveWhiteSpace = true } = options;
    const _serializedNode = serializeNode(n, {
      doc,
      mirror,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      inlineStylesheet,
      maskInputOptions,
      maskTextFn,
      maskInputFn,
      dataURLOptions,
      inlineImages,
      recordCanvas,
      keepIframeSrcFn,
      newlyAddedElement,
    });
    if (!_serializedNode) {
      console.warn(n, "not serialized");
      return null;
    }
    let id;
    if (mirror.hasNode(n)) {
      id = mirror.getId(n);
    } else if (
      slimDOMExcluded(_serializedNode, slimDOMOptions) ||
      (!preserveWhiteSpace &&
        _serializedNode.type === NodeType.Text &&
        !_serializedNode.isStyle &&
        !_serializedNode.textContent.replace(/^\s+|\s+$/gm, "").length)
    ) {
      id = IGNORED_NODE;
    } else {
      id = genId();
    }
    const serializedNode = Object.assign(_serializedNode, { id });
    mirror.add(n, serializedNode);
    if (id === IGNORED_NODE) {
      return null;
    }
    if (onSerialize) {
      onSerialize(n);
    }
    let recordChild = !skipChild;
    if (serializedNode.type === NodeType.Element) {
      recordChild = recordChild && !serializedNode.needBlock;
      delete serializedNode.needBlock;
      const shadowRoot = n.shadowRoot;
      if (shadowRoot && isNativeShadowDom(shadowRoot)) serializedNode.isShadowHost = true;
    }
    if ((serializedNode.type === NodeType.Document || serializedNode.type === NodeType.Element) && recordChild) {
      if (
        slimDOMOptions.headWhitespace &&
        serializedNode.type === NodeType.Element &&
        serializedNode.tagName === "head"
      ) {
        preserveWhiteSpace = false;
      }
      const bypassOptions = {
        doc,
        mirror,
        blockClass,
        blockSelector,
        maskTextClass,
        maskTextSelector,
        skipChild,
        inlineStylesheet,
        maskInputOptions,
        maskTextFn,
        maskInputFn,
        slimDOMOptions,
        dataURLOptions,
        inlineImages,
        recordCanvas,
        preserveWhiteSpace,
        onSerialize,
        onIframeLoad,
        iframeLoadTimeout,
        onStylesheetLoad,
        stylesheetLoadTimeout,
        keepIframeSrcFn,
      };
      for (const childN of Array.from(n.childNodes)) {
        const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
        if (serializedChildNode) {
          serializedNode.childNodes.push(serializedChildNode);
        }
      }
      if (isElement(n) && n.shadowRoot) {
        for (const childN of Array.from(n.shadowRoot.childNodes)) {
          const serializedChildNode = serializeNodeWithId(childN, bypassOptions);
          if (serializedChildNode) {
            isNativeShadowDom(n.shadowRoot) && (serializedChildNode.isShadow = true);
            serializedNode.childNodes.push(serializedChildNode);
          }
        }
      }
    }
    if (n.parentNode && isShadowRoot(n.parentNode) && isNativeShadowDom(n.parentNode)) {
      serializedNode.isShadow = true;
    }
    if (serializedNode.type === NodeType.Element && serializedNode.tagName === "iframe") {
      onceIframeLoaded(
        n,
        () => {
          const iframeDoc = n.contentDocument;
          if (iframeDoc && onIframeLoad) {
            const serializedIframeNode = serializeNodeWithId(iframeDoc, {
              doc: iframeDoc,
              mirror,
              blockClass,
              blockSelector,
              maskTextClass,
              maskTextSelector,
              skipChild: false,
              inlineStylesheet,
              maskInputOptions,
              maskTextFn,
              maskInputFn,
              slimDOMOptions,
              dataURLOptions,
              inlineImages,
              recordCanvas,
              preserveWhiteSpace,
              onSerialize,
              onIframeLoad,
              iframeLoadTimeout,
              onStylesheetLoad,
              stylesheetLoadTimeout,
              keepIframeSrcFn,
            });
            if (serializedIframeNode) {
              onIframeLoad(n, serializedIframeNode);
            }
          }
        },
        iframeLoadTimeout
      );
    }
    if (
      serializedNode.type === NodeType.Element &&
      serializedNode.tagName === "link" &&
      serializedNode.attributes.rel === "stylesheet"
    ) {
      onceStylesheetLoaded(
        n,
        () => {
          if (onStylesheetLoad) {
            const serializedLinkNode = serializeNodeWithId(n, {
              doc,
              mirror,
              blockClass,
              blockSelector,
              maskTextClass,
              maskTextSelector,
              skipChild: false,
              inlineStylesheet,
              maskInputOptions,
              maskTextFn,
              maskInputFn,
              slimDOMOptions,
              dataURLOptions,
              inlineImages,
              recordCanvas,
              preserveWhiteSpace,
              onSerialize,
              onIframeLoad,
              iframeLoadTimeout,
              onStylesheetLoad,
              stylesheetLoadTimeout,
              keepIframeSrcFn,
            });
            if (serializedLinkNode) {
              onStylesheetLoad(n, serializedLinkNode);
            }
          }
        },
        stylesheetLoadTimeout
      );
    }
    return serializedNode;
  }
  function snapshot(n, options) {
    const {
      mirror = new Mirror(),
      blockClass = "rr-block",
      blockSelector = null,
      maskTextClass = "rr-mask",
      maskTextSelector = null,
      inlineStylesheet = true,
      inlineImages = false,
      recordCanvas = false,
      maskAllInputs = false,
      maskTextFn,
      maskInputFn,
      slimDOM = false,
      dataURLOptions,
      preserveWhiteSpace,
      onSerialize,
      onIframeLoad,
      iframeLoadTimeout,
      onStylesheetLoad,
      stylesheetLoadTimeout,
      keepIframeSrcFn = () => false,
    } = options || {};
    const maskInputOptions =
      maskAllInputs === true
        ? {
            color: true,
            date: true,
            "datetime-local": true,
            email: true,
            month: true,
            number: true,
            range: true,
            search: true,
            tel: true,
            text: true,
            time: true,
            url: true,
            week: true,
            textarea: true,
            select: true,
            password: true,
          }
        : maskAllInputs === false
        ? {
            password: true,
          }
        : maskAllInputs;
    const slimDOMOptions =
      slimDOM === true || slimDOM === "all"
        ? {
            script: true,
            comment: true,
            headFavicon: true,
            headWhitespace: true,
            headMetaDescKeywords: slimDOM === "all",
            headMetaSocial: true,
            headMetaRobots: true,
            headMetaHttpEquiv: true,
            headMetaAuthorship: true,
            headMetaVerification: true,
          }
        : slimDOM === false
        ? {}
        : slimDOM;
    return serializeNodeWithId(n, {
      doc: n,
      mirror,
      blockClass,
      blockSelector,
      maskTextClass,
      maskTextSelector,
      skipChild: false,
      inlineStylesheet,
      maskInputOptions,
      maskTextFn,
      maskInputFn,
      slimDOMOptions,
      dataURLOptions,
      inlineImages,
      recordCanvas,
      preserveWhiteSpace,
      onSerialize,
      onIframeLoad,
      iframeLoadTimeout,
      onStylesheetLoad,
      stylesheetLoadTimeout,
      keepIframeSrcFn,
      newlyAddedElement: false,
    });
  }

  function on(type, fn, target = document) {
    const options = { capture: true, passive: true };
    target.addEventListener(type, fn, options);
    return () => target.removeEventListener(type, fn, options);
  }
  const DEPARTED_MIRROR_ACCESS_WARNING =
    "Please stop import mirror directly. Instead of that," +
    "\r\n" +
    "now you can use replayer.getMirror() to access the mirror instance of a replayer," +
    "\r\n" +
    "or you can use record.mirror to access the mirror instance during recording.";
  let _mirror = {
    map: {},
    getId() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      return -1;
    },
    getNode() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      return null;
    },
    removeNodeFromMap() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
    has() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
      return false;
    },
    reset() {
      console.error(DEPARTED_MIRROR_ACCESS_WARNING);
    },
  };
  if (typeof window !== "undefined" && window.Proxy && window.Reflect) {
    _mirror = new Proxy(_mirror, {
      get(target, prop, receiver) {
        if (prop === "map") {
          console.error(DEPARTED_MIRROR_ACCESS_WARNING);
        }
        return Reflect.get(target, prop, receiver);
      },
    });
  }
  function throttle(func, wait, options = {}) {
    let timeout = null;
    let previous = 0;
    return function (...args) {
      const now = Date.now();
      if (!previous && options.leading === false) {
        previous = now;
      }
      const remaining = wait - (now - previous);
      const context = this;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        func.apply(context, args);
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(() => {
          previous = options.leading === false ? 0 : Date.now();
          timeout = null;
          func.apply(context, args);
        }, remaining);
      }
    };
  }
  function hookSetter(target, key, d, isRevoked, win = window) {
    const original = win.Object.getOwnPropertyDescriptor(target, key);
    win.Object.defineProperty(
      target,
      key,
      isRevoked
        ? d
        : {
            set(value) {
              setTimeout(() => {
                d.set.call(this, value);
              }, 0);
              if (original && original.set) {
                original.set.call(this, value);
              }
            },
          }
    );
    return () => hookSetter(target, key, original || {}, true);
  }
  function patch(source, name, replacement) {
    try {
      if (!(name in source)) {
        return () => {};
      }
      const original = source[name];
      const wrapped = replacement(original);
      if (typeof wrapped === "function") {
        wrapped.prototype = wrapped.prototype || {};
        Object.defineProperties(wrapped, {
          __rrweb_original__: {
            enumerable: false,
            value: original,
          },
        });
      }
      source[name] = wrapped;
      return () => {
        source[name] = original;
      };
    } catch (_a) {
      return () => {};
    }
  }
  let nowTimestamp = Date.now;
  if (!/[1-9][0-9]{12}/.test(Date.now().toString())) {
    nowTimestamp = () => new Date().getTime();
  }
  function getWindowScroll(win) {
    var _a, _b, _c, _d, _e, _f;
    const doc = win.document;
    return {
      left: doc.scrollingElement
        ? doc.scrollingElement.scrollLeft
        : win.pageXOffset !== undefined
        ? win.pageXOffset
        : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollLeft) ||
          ((_b =
            (_a = doc === null || doc === void 0 ? void 0 : doc.body) === null || _a === void 0
              ? void 0
              : _a.parentElement) === null || _b === void 0
            ? void 0
            : _b.scrollLeft) ||
          ((_c = doc === null || doc === void 0 ? void 0 : doc.body) === null || _c === void 0
            ? void 0
            : _c.scrollLeft) ||
          0,
      top: doc.scrollingElement
        ? doc.scrollingElement.scrollTop
        : win.pageYOffset !== undefined
        ? win.pageYOffset
        : (doc === null || doc === void 0 ? void 0 : doc.documentElement.scrollTop) ||
          ((_e =
            (_d = doc === null || doc === void 0 ? void 0 : doc.body) === null || _d === void 0
              ? void 0
              : _d.parentElement) === null || _e === void 0
            ? void 0
            : _e.scrollTop) ||
          ((_f = doc === null || doc === void 0 ? void 0 : doc.body) === null || _f === void 0
            ? void 0
            : _f.scrollTop) ||
          0,
    };
  }
  function getWindowHeight() {
    return (
      window.innerHeight ||
      (document.documentElement && document.documentElement.clientHeight) ||
      (document.body && document.body.clientHeight)
    );
  }
  function getWindowWidth() {
    return (
      window.innerWidth ||
      (document.documentElement && document.documentElement.clientWidth) ||
      (document.body && document.body.clientWidth)
    );
  }
  function isBlocked(node, blockClass, blockSelector, checkAncestors) {
    if (!node) {
      return false;
    }
    const el = node.nodeType === node.ELEMENT_NODE ? node : node.parentElement;
    if (!el) return false;
    try {
      if (typeof blockClass === "string") {
        if (el.classList.contains(blockClass)) return true;
        if (checkAncestors && el.closest("." + blockClass) !== null) return true;
      } else {
        if (classMatchesRegex(el, blockClass, checkAncestors)) return true;
      }
    } catch (e) {}
    if (blockSelector) {
      if (el.matches(blockSelector)) return true;
      if (checkAncestors && el.closest(blockSelector) !== null) return true;
    }
    return false;
  }
  function isSerialized(n, mirror) {
    return mirror.getId(n) !== -1;
  }
  function isIgnored(n, mirror) {
    return mirror.getId(n) === IGNORED_NODE;
  }
  function isAncestorRemoved(target, mirror) {
    if (isShadowRoot(target)) {
      return false;
    }
    const id = mirror.getId(target);
    if (!mirror.has(id)) {
      return true;
    }
    if (target.parentNode && target.parentNode.nodeType === target.DOCUMENT_NODE) {
      return false;
    }
    if (!target.parentNode) {
      return true;
    }
    return isAncestorRemoved(target.parentNode, mirror);
  }
  function legacy_isTouchEvent(event) {
    return Boolean(event.changedTouches);
  }
  function polyfill(win = window) {
    if ("NodeList" in win && !win.NodeList.prototype.forEach) {
      win.NodeList.prototype.forEach = Array.prototype.forEach;
    }
    if ("DOMTokenList" in win && !win.DOMTokenList.prototype.forEach) {
      win.DOMTokenList.prototype.forEach = Array.prototype.forEach;
    }
    if (!Node.prototype.contains) {
      Node.prototype.contains = (...args) => {
        let node = args[0];
        if (!(0 in args)) {
          throw new TypeError("1 argument is required");
        }
        do {
          if (this === node) {
            return true;
          }
        } while ((node = node && node.parentNode));
        return false;
      };
    }
  }
  function isSerializedIframe(n, mirror) {
    return Boolean(n.nodeName === "IFRAME" && mirror.getMeta(n));
  }
  function isSerializedStylesheet(n, mirror) {
    return Boolean(
      n.nodeName === "LINK" &&
        n.nodeType === n.ELEMENT_NODE &&
        n.getAttribute &&
        n.getAttribute("rel") === "stylesheet" &&
        mirror.getMeta(n)
    );
  }
  function hasShadowRoot(n) {
    return Boolean(n === null || n === void 0 ? void 0 : n.shadowRoot);
  }
  class StyleSheetMirror {
    constructor() {
      this.id = 1;
      this.styleIDMap = new WeakMap();
      this.idStyleMap = new Map();
    }
    getId(stylesheet) {
      var _a;
      return (_a = this.styleIDMap.get(stylesheet)) !== null && _a !== void 0 ? _a : -1;
    }
    has(stylesheet) {
      return this.styleIDMap.has(stylesheet);
    }
    add(stylesheet, id) {
      if (this.has(stylesheet)) return this.getId(stylesheet);
      let newId;
      if (id === undefined) {
        newId = this.id++;
      } else newId = id;
      this.styleIDMap.set(stylesheet, newId);
      this.idStyleMap.set(newId, stylesheet);
      return newId;
    }
    getStyle(id) {
      return this.idStyleMap.get(id) || null;
    }
    reset() {
      this.styleIDMap = new WeakMap();
      this.idStyleMap = new Map();
      this.id = 1;
    }
    generateId() {
      return this.id++;
    }
  }
  function getShadowHost(n) {
    var _a, _b;
    let shadowHost = null;
    if (
      ((_b = (_a = n.getRootNode) === null || _a === void 0 ? void 0 : _a.call(n)) === null || _b === void 0
        ? void 0
        : _b.nodeType) === Node.DOCUMENT_FRAGMENT_NODE &&
      n.getRootNode().host
    )
      shadowHost = n.getRootNode().host;
    return shadowHost;
  }
  function getRootShadowHost(n) {
    let rootShadowHost = n;
    let shadowHost;
    while ((shadowHost = getShadowHost(rootShadowHost))) rootShadowHost = shadowHost;
    return rootShadowHost;
  }
  function shadowHostInDom(n) {
    const doc = n.ownerDocument;
    if (!doc) return false;
    const shadowHost = getRootShadowHost(n);
    return doc.contains(shadowHost);
  }
  function inDom(n) {
    const doc = n.ownerDocument;
    if (!doc) return false;
    return doc.contains(n) || shadowHostInDom(n);
  }

  var EventType = /* @__PURE__ */ ((EventType2) => {
    EventType2[(EventType2["DomContentLoaded"] = 0)] = "DomContentLoaded";
    EventType2[(EventType2["Load"] = 1)] = "Load";
    EventType2[(EventType2["FullSnapshot"] = 2)] = "FullSnapshot";
    EventType2[(EventType2["IncrementalSnapshot"] = 3)] = "IncrementalSnapshot";
    EventType2[(EventType2["Meta"] = 4)] = "Meta";
    EventType2[(EventType2["Custom"] = 5)] = "Custom";
    EventType2[(EventType2["Plugin"] = 6)] = "Plugin";
    return EventType2;
  })(EventType || {});
  var IncrementalSource = /* @__PURE__ */ ((IncrementalSource2) => {
    IncrementalSource2[(IncrementalSource2["Mutation"] = 0)] = "Mutation";
    IncrementalSource2[(IncrementalSource2["MouseMove"] = 1)] = "MouseMove";
    IncrementalSource2[(IncrementalSource2["MouseInteraction"] = 2)] = "MouseInteraction";
    IncrementalSource2[(IncrementalSource2["Scroll"] = 3)] = "Scroll";
    IncrementalSource2[(IncrementalSource2["ViewportResize"] = 4)] = "ViewportResize";
    IncrementalSource2[(IncrementalSource2["Input"] = 5)] = "Input";
    IncrementalSource2[(IncrementalSource2["TouchMove"] = 6)] = "TouchMove";
    IncrementalSource2[(IncrementalSource2["MediaInteraction"] = 7)] = "MediaInteraction";
    IncrementalSource2[(IncrementalSource2["StyleSheetRule"] = 8)] = "StyleSheetRule";
    IncrementalSource2[(IncrementalSource2["CanvasMutation"] = 9)] = "CanvasMutation";
    IncrementalSource2[(IncrementalSource2["Font"] = 10)] = "Font";
    IncrementalSource2[(IncrementalSource2["Log"] = 11)] = "Log";
    IncrementalSource2[(IncrementalSource2["Drag"] = 12)] = "Drag";
    IncrementalSource2[(IncrementalSource2["StyleDeclaration"] = 13)] = "StyleDeclaration";
    IncrementalSource2[(IncrementalSource2["Selection"] = 14)] = "Selection";
    IncrementalSource2[(IncrementalSource2["AdoptedStyleSheet"] = 15)] = "AdoptedStyleSheet";
    IncrementalSource2[(IncrementalSource2["CustomElement"] = 16)] = "CustomElement";
    return IncrementalSource2;
  })(IncrementalSource || {});
  var MouseInteractions = /* @__PURE__ */ ((MouseInteractions2) => {
    MouseInteractions2[(MouseInteractions2["MouseUp"] = 0)] = "MouseUp";
    MouseInteractions2[(MouseInteractions2["MouseDown"] = 1)] = "MouseDown";
    MouseInteractions2[(MouseInteractions2["Click"] = 2)] = "Click";
    MouseInteractions2[(MouseInteractions2["ContextMenu"] = 3)] = "ContextMenu";
    MouseInteractions2[(MouseInteractions2["DblClick"] = 4)] = "DblClick";
    MouseInteractions2[(MouseInteractions2["Focus"] = 5)] = "Focus";
    MouseInteractions2[(MouseInteractions2["Blur"] = 6)] = "Blur";
    MouseInteractions2[(MouseInteractions2["TouchStart"] = 7)] = "TouchStart";
    MouseInteractions2[(MouseInteractions2["TouchMove_Departed"] = 8)] = "TouchMove_Departed";
    MouseInteractions2[(MouseInteractions2["TouchEnd"] = 9)] = "TouchEnd";
    MouseInteractions2[(MouseInteractions2["TouchCancel"] = 10)] = "TouchCancel";
    return MouseInteractions2;
  })(MouseInteractions || {});
  var PointerTypes = /* @__PURE__ */ ((PointerTypes2) => {
    PointerTypes2[(PointerTypes2["Mouse"] = 0)] = "Mouse";
    PointerTypes2[(PointerTypes2["Pen"] = 1)] = "Pen";
    PointerTypes2[(PointerTypes2["Touch"] = 2)] = "Touch";
    return PointerTypes2;
  })(PointerTypes || {});
  var CanvasContext = /* @__PURE__ */ ((CanvasContext2) => {
    CanvasContext2[(CanvasContext2["2D"] = 0)] = "2D";
    CanvasContext2[(CanvasContext2["WebGL"] = 1)] = "WebGL";
    CanvasContext2[(CanvasContext2["WebGL2"] = 2)] = "WebGL2";
    return CanvasContext2;
  })(CanvasContext || {});

  function isNodeInLinkedList(n) {
    return "__ln" in n;
  }
  class DoubleLinkedList {
    constructor() {
      this.length = 0;
      this.head = null;
      this.tail = null;
    }
    get(position) {
      if (position >= this.length) {
        throw new Error("Position outside of list range");
      }
      let current = this.head;
      for (let index = 0; index < position; index++) {
        current = (current === null || current === void 0 ? void 0 : current.next) || null;
      }
      return current;
    }
    addNode(n) {
      const node = {
        value: n,
        previous: null,
        next: null,
      };
      n.__ln = node;
      if (n.previousSibling && isNodeInLinkedList(n.previousSibling)) {
        const current = n.previousSibling.__ln.next;
        node.next = current;
        node.previous = n.previousSibling.__ln;
        n.previousSibling.__ln.next = node;
        if (current) {
          current.previous = node;
        }
      } else if (n.nextSibling && isNodeInLinkedList(n.nextSibling) && n.nextSibling.__ln.previous) {
        const current = n.nextSibling.__ln.previous;
        node.previous = current;
        node.next = n.nextSibling.__ln;
        n.nextSibling.__ln.previous = node;
        if (current) {
          current.next = node;
        }
      } else {
        if (this.head) {
          this.head.previous = node;
        }
        node.next = this.head;
        this.head = node;
      }
      if (node.next === null) {
        this.tail = node;
      }
      this.length++;
    }
    removeNode(n) {
      const current = n.__ln;
      if (!this.head) {
        return;
      }
      if (!current.previous) {
        this.head = current.next;
        if (this.head) {
          this.head.previous = null;
        } else {
          this.tail = null;
        }
      } else {
        current.previous.next = current.next;
        if (current.next) {
          current.next.previous = current.previous;
        } else {
          this.tail = current.previous;
        }
      }
      if (n.__ln) {
        delete n.__ln;
      }
      this.length--;
    }
  }
  const moveKey = (id, parentId) => `${id}@${parentId}`;
  class MutationBuffer {
    constructor() {
      this.frozen = false;
      this.locked = false;
      this.texts = [];
      this.attributes = [];
      this.removes = [];
      this.mapRemoves = [];
      this.movedMap = {};
      this.addedSet = new Set();
      this.movedSet = new Set();
      this.droppedSet = new Set();
      this.processMutations = (mutations) => {
        mutations.forEach(this.processMutation);
        this.emit();
      };
      this.emit = () => {
        if (this.frozen || this.locked) {
          return;
        }
        const adds = [];
        const addedIds = new Set();
        const addList = new DoubleLinkedList();
        const getNextId = (n) => {
          let ns = n;
          let nextId = IGNORED_NODE;
          while (nextId === IGNORED_NODE) {
            ns = ns && ns.nextSibling;
            nextId = ns && this.mirror.getId(ns);
          }
          return nextId;
        };
        const pushAdd = (n) => {
          if (!n.parentNode || !inDom(n)) {
            return;
          }
          const parentId = isShadowRoot(n.parentNode)
            ? this.mirror.getId(getShadowHost(n))
            : this.mirror.getId(n.parentNode);
          const nextId = getNextId(n);
          if (parentId === -1 || nextId === -1) {
            return addList.addNode(n);
          }
          const sn = serializeNodeWithId(n, {
            doc: this.doc,
            mirror: this.mirror,
            blockClass: this.blockClass,
            blockSelector: this.blockSelector,
            maskTextClass: this.maskTextClass,
            maskTextSelector: this.maskTextSelector,
            skipChild: true,
            newlyAddedElement: true,
            inlineStylesheet: this.inlineStylesheet,
            maskInputOptions: this.maskInputOptions,
            maskTextFn: this.maskTextFn,
            maskInputFn: this.maskInputFn,
            slimDOMOptions: this.slimDOMOptions,
            dataURLOptions: this.dataURLOptions,
            recordCanvas: this.recordCanvas,
            inlineImages: this.inlineImages,
            onSerialize: (currentN) => {
              if (isSerializedIframe(currentN, this.mirror)) {
                this.iframeManager.addIframe(currentN);
              }
              if (isSerializedStylesheet(currentN, this.mirror)) {
                this.stylesheetManager.trackLinkElement(currentN);
              }
              if (hasShadowRoot(n)) {
                this.shadowDomManager.addShadowRoot(n.shadowRoot, this.doc);
              }
            },
            onIframeLoad: (iframe, childSn) => {
              this.iframeManager.attachIframe(iframe, childSn);
              this.shadowDomManager.observeAttachShadow(iframe);
            },
            onStylesheetLoad: (link, childSn) => {
              this.stylesheetManager.attachLinkElement(link, childSn);
            },
          });
          if (sn) {
            adds.push({
              parentId,
              nextId,
              node: sn,
            });
            addedIds.add(sn.id);
          }
        };
        while (this.mapRemoves.length) {
          this.mirror.removeNodeFromMap(this.mapRemoves.shift());
        }
        for (const n of this.movedSet) {
          if (isParentRemoved(this.removes, n, this.mirror) && !this.movedSet.has(n.parentNode)) {
            continue;
          }
          pushAdd(n);
        }
        for (const n of this.addedSet) {
          if (!isAncestorInSet(this.droppedSet, n) && !isParentRemoved(this.removes, n, this.mirror)) {
            pushAdd(n);
          } else if (isAncestorInSet(this.movedSet, n)) {
            pushAdd(n);
          } else {
            this.droppedSet.add(n);
          }
        }
        let candidate = null;
        while (addList.length) {
          let node = null;
          if (candidate) {
            const parentId = this.mirror.getId(candidate.value.parentNode);
            const nextId = getNextId(candidate.value);
            if (parentId !== -1 && nextId !== -1) {
              node = candidate;
            }
          }
          if (!node) {
            let tailNode = addList.tail;
            while (tailNode) {
              const _node = tailNode;
              tailNode = tailNode.previous;
              if (_node) {
                const parentId = this.mirror.getId(_node.value.parentNode);
                const nextId = getNextId(_node.value);
                if (nextId === -1) continue;
                else if (parentId !== -1) {
                  node = _node;
                  break;
                } else {
                  const unhandledNode = _node.value;
                  if (unhandledNode.parentNode && unhandledNode.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                    const shadowHost = unhandledNode.parentNode.host;
                    const parentId = this.mirror.getId(shadowHost);
                    if (parentId !== -1) {
                      node = _node;
                      break;
                    }
                  }
                }
              }
            }
          }
          if (!node) {
            while (addList.head) {
              addList.removeNode(addList.head.value);
            }
            break;
          }
          candidate = node.previous;
          addList.removeNode(node.value);
          pushAdd(node.value);
        }
        const payload = {
          texts: this.texts
            .map((text) => ({
              id: this.mirror.getId(text.node),
              value: text.value,
            }))
            .filter((text) => !addedIds.has(text.id))
            .filter((text) => this.mirror.has(text.id)),
          attributes: this.attributes
            .map((attribute) => {
              const { attributes } = attribute;
              if (typeof attributes.style === "string") {
                const diffAsStr = JSON.stringify(attribute.styleDiff);
                const unchangedAsStr = JSON.stringify(attribute._unchangedStyles);
                if (diffAsStr.length < attributes.style.length) {
                  if ((diffAsStr + unchangedAsStr).split("var(").length === attributes.style.split("var(").length) {
                    attributes.style = attribute.styleDiff;
                  }
                }
              }
              return {
                id: this.mirror.getId(attribute.node),
                attributes: attributes,
              };
            })
            .filter((attribute) => !addedIds.has(attribute.id))
            .filter((attribute) => this.mirror.has(attribute.id)),
          removes: this.removes,
          adds,
        };
        if (!payload.texts.length && !payload.attributes.length && !payload.removes.length && !payload.adds.length) {
          return;
        }
        this.texts = [];
        this.attributes = [];
        this.removes = [];
        this.addedSet = new Set();
        this.movedSet = new Set();
        this.droppedSet = new Set();
        this.movedMap = {};
        this.mutationCb(payload);
      };
      this.processMutation = (m) => {
        if (isIgnored(m.target, this.mirror)) {
          return;
        }
        let unattachedDoc;
        try {
          unattachedDoc = document.implementation.createHTMLDocument();
        } catch (e) {
          unattachedDoc = this.doc;
        }
        switch (m.type) {
          case "characterData": {
            const value = m.target.textContent;
            if (!isBlocked(m.target, this.blockClass, this.blockSelector, false) && value !== m.oldValue) {
              this.texts.push({
                value:
                  needMaskingText(m.target, this.maskTextClass, this.maskTextSelector) && value
                    ? this.maskTextFn
                      ? this.maskTextFn(value)
                      : value.replace(/[\S]/g, "*")
                    : value,
                node: m.target,
              });
            }
            break;
          }
          case "attributes": {
            const target = m.target;
            let attributeName = m.attributeName;
            let value = m.target.getAttribute(attributeName);
            if (attributeName === "value") {
              const type = getInputType(target);
              value = maskInputValue({
                element: target,
                maskInputOptions: this.maskInputOptions,
                tagName: target.tagName,
                type,
                value,
                maskInputFn: this.maskInputFn,
              });
            }
            if (isBlocked(m.target, this.blockClass, this.blockSelector, false) || value === m.oldValue) {
              return;
            }
            let item = this.attributes.find((a) => a.node === m.target);
            if (target.tagName === "IFRAME" && attributeName === "src" && !this.keepIframeSrcFn(value)) {
              if (!target.contentDocument) {
                attributeName = "rr_src";
              } else {
                return;
              }
            }
            if (!item) {
              item = {
                node: m.target,
                attributes: {},
                styleDiff: {},
                _unchangedStyles: {},
              };
              this.attributes.push(item);
            }
            if (
              attributeName === "type" &&
              target.tagName === "INPUT" &&
              (m.oldValue || "").toLowerCase() === "password"
            ) {
              target.setAttribute("data-rr-is-password", "true");
            }
            if (!ignoreAttribute(target.tagName, attributeName)) {
              item.attributes[attributeName] = transformAttribute(
                this.doc,
                toLowerCase(target.tagName),
                toLowerCase(attributeName),
                value
              );
              if (attributeName === "style") {
                const old = unattachedDoc.createElement("span");
                if (m.oldValue) {
                  old.setAttribute("style", m.oldValue);
                }
                for (const pname of Array.from(target.style)) {
                  const newValue = target.style.getPropertyValue(pname);
                  const newPriority = target.style.getPropertyPriority(pname);
                  if (
                    newValue !== old.style.getPropertyValue(pname) ||
                    newPriority !== old.style.getPropertyPriority(pname)
                  ) {
                    if (newPriority === "") {
                      item.styleDiff[pname] = newValue;
                    } else {
                      item.styleDiff[pname] = [newValue, newPriority];
                    }
                  } else {
                    item._unchangedStyles[pname] = [newValue, newPriority];
                  }
                }
                for (const pname of Array.from(old.style)) {
                  if (target.style.getPropertyValue(pname) === "") {
                    item.styleDiff[pname] = false;
                  }
                }
              }
            }
            break;
          }
          case "childList": {
            if (isBlocked(m.target, this.blockClass, this.blockSelector, true)) return;
            m.addedNodes.forEach((n) => this.genAdds(n, m.target));
            m.removedNodes.forEach((n) => {
              const nodeId = this.mirror.getId(n);
              const parentId = isShadowRoot(m.target) ? this.mirror.getId(m.target.host) : this.mirror.getId(m.target);
              if (
                isBlocked(m.target, this.blockClass, this.blockSelector, false) ||
                isIgnored(n, this.mirror) ||
                !isSerialized(n, this.mirror)
              ) {
                return;
              }
              if (this.addedSet.has(n)) {
                deepDelete(this.addedSet, n);
                this.droppedSet.add(n);
              } else if (this.addedSet.has(m.target) && nodeId === -1);
              else if (isAncestorRemoved(m.target, this.mirror));
              else if (this.movedSet.has(n) && this.movedMap[moveKey(nodeId, parentId)]) {
                deepDelete(this.movedSet, n);
              } else {
                this.removes.push({
                  parentId,
                  id: nodeId,
                  isShadow: isShadowRoot(m.target) && isNativeShadowDom(m.target) ? true : undefined,
                });
              }
              this.mapRemoves.push(n);
            });
            break;
          }
        }
      };
      this.genAdds = (n, target) => {
        if (this.processedNodeManager.inOtherBuffer(n, this)) return;
        if (this.addedSet.has(n) || this.movedSet.has(n)) return;
        if (this.mirror.hasNode(n)) {
          if (isIgnored(n, this.mirror)) {
            return;
          }
          this.movedSet.add(n);
          let targetId = null;
          if (target && this.mirror.hasNode(target)) {
            targetId = this.mirror.getId(target);
          }
          if (targetId && targetId !== -1) {
            this.movedMap[moveKey(this.mirror.getId(n), targetId)] = true;
          }
        } else {
          this.addedSet.add(n);
          this.droppedSet.delete(n);
        }
        if (!isBlocked(n, this.blockClass, this.blockSelector, false)) {
          n.childNodes.forEach((childN) => this.genAdds(childN));
          if (hasShadowRoot(n)) {
            n.shadowRoot.childNodes.forEach((childN) => {
              this.processedNodeManager.add(childN, this);
              this.genAdds(childN, n);
            });
          }
        }
      };
    }
    init(options) {
      [
        "mutationCb",
        "blockClass",
        "blockSelector",
        "maskTextClass",
        "maskTextSelector",
        "inlineStylesheet",
        "maskInputOptions",
        "maskTextFn",
        "maskInputFn",
        "keepIframeSrcFn",
        "recordCanvas",
        "inlineImages",
        "slimDOMOptions",
        "dataURLOptions",
        "doc",
        "mirror",
        "iframeManager",
        "stylesheetManager",
        "shadowDomManager",
        "canvasManager",
        "processedNodeManager",
      ].forEach((key) => {
        this[key] = options[key];
      });
    }
    freeze() {
      this.frozen = true;
      this.canvasManager.freeze();
    }
    unfreeze() {
      this.frozen = false;
      this.canvasManager.unfreeze();
      this.emit();
    }
    isFrozen() {
      return this.frozen;
    }
    lock() {
      this.locked = true;
      this.canvasManager.lock();
    }
    unlock() {
      this.locked = false;
      this.canvasManager.unlock();
      this.emit();
    }
    reset() {
      this.shadowDomManager.reset();
      this.canvasManager.reset();
    }
  }
  function deepDelete(addsSet, n) {
    addsSet.delete(n);
    n.childNodes.forEach((childN) => deepDelete(addsSet, childN));
  }
  function isParentRemoved(removes, n, mirror) {
    if (removes.length === 0) return false;
    return _isParentRemoved(removes, n, mirror);
  }
  function _isParentRemoved(removes, n, mirror) {
    const { parentNode } = n;
    if (!parentNode) {
      return false;
    }
    const parentId = mirror.getId(parentNode);
    if (removes.some((r) => r.id === parentId)) {
      return true;
    }
    return _isParentRemoved(removes, parentNode, mirror);
  }
  function isAncestorInSet(set, n) {
    if (set.size === 0) return false;
    return _isAncestorInSet(set, n);
  }
  function _isAncestorInSet(set, n) {
    const { parentNode } = n;
    if (!parentNode) {
      return false;
    }
    if (set.has(parentNode)) {
      return true;
    }
    return _isAncestorInSet(set, parentNode);
  }

  let errorHandler;
  function registerErrorHandler(handler) {
    errorHandler = handler;
  }
  function unregisterErrorHandler() {
    errorHandler = undefined;
  }
  const callbackWrapper = (cb) => {
    if (!errorHandler) {
      return cb;
    }
    const rrwebWrapped = (...rest) => {
      try {
        return cb(...rest);
      } catch (error) {
        if (errorHandler && errorHandler(error) === true) {
          return;
        }
        throw error;
      }
    };
    return rrwebWrapped;
  };

  const mutationBuffers = [];
  function getEventTarget(event) {
    try {
      if ("composedPath" in event) {
        const path = event.composedPath();
        if (path.length) {
          return path[0];
        }
      } else if ("path" in event && event.path.length) {
        return event.path[0];
      }
    } catch (_a) {}
    return event && event.target;
  }
  function initMutationObserver(options, rootEl) {
    var _a, _b;
    const mutationBuffer = new MutationBuffer();
    mutationBuffers.push(mutationBuffer);
    mutationBuffer.init(options);
    let mutationObserverCtor = window.MutationObserver || window.__rrMutationObserver;
    const angularZoneSymbol =
      (_b =
        (_a = window === null || window === void 0 ? void 0 : window.Zone) === null || _a === void 0
          ? void 0
          : _a.__symbol__) === null || _b === void 0
        ? void 0
        : _b.call(_a, "MutationObserver");
    if (angularZoneSymbol && window[angularZoneSymbol]) {
      mutationObserverCtor = window[angularZoneSymbol];
    }
    const observer = new mutationObserverCtor(callbackWrapper(mutationBuffer.processMutations.bind(mutationBuffer)));
    observer.observe(rootEl, {
      attributes: true,
      attributeOldValue: true,
      characterData: true,
      characterDataOldValue: true,
      childList: true,
      subtree: true,
    });
    return observer;
  }
  function initMoveObserver({ mousemoveCb, sampling, doc, mirror }) {
    if (sampling.mousemove === false) {
      return () => {};
    }
    const threshold = typeof sampling.mousemove === "number" ? sampling.mousemove : 50;
    const callbackThreshold = typeof sampling.mousemoveCallback === "number" ? sampling.mousemoveCallback : 500;
    let positions = [];
    let timeBaseline;
    const wrappedCb = throttle(
      callbackWrapper((source) => {
        const totalOffset = Date.now() - timeBaseline;
        mousemoveCb(
          positions.map((p) => {
            p.timeOffset -= totalOffset;
            return p;
          }),
          source
        );
        positions = [];
        timeBaseline = null;
      }),
      callbackThreshold
    );
    const updatePosition = callbackWrapper(
      throttle(
        callbackWrapper((evt) => {
          const target = getEventTarget(evt);
          const { clientX, clientY } = legacy_isTouchEvent(evt) ? evt.changedTouches[0] : evt;
          if (!timeBaseline) {
            timeBaseline = nowTimestamp();
          }
          positions.push({
            x: clientX,
            y: clientY,
            id: mirror.getId(target),
            timeOffset: nowTimestamp() - timeBaseline,
          });
          wrappedCb(
            typeof DragEvent !== "undefined" && evt instanceof DragEvent
              ? IncrementalSource.Drag
              : evt instanceof MouseEvent
              ? IncrementalSource.MouseMove
              : IncrementalSource.TouchMove
          );
        }),
        threshold,
        {
          trailing: false,
        }
      )
    );
    const handlers = [
      on("mousemove", updatePosition, doc),
      on("touchmove", updatePosition, doc),
      on("drag", updatePosition, doc),
    ];
    return callbackWrapper(() => {
      handlers.forEach((h) => h());
    });
  }
  function initMouseInteractionObserver({ mouseInteractionCb, doc, mirror, blockClass, blockSelector, sampling }) {
    if (sampling.mouseInteraction === false) {
      return () => {};
    }
    const disableMap =
      sampling.mouseInteraction === true || sampling.mouseInteraction === undefined ? {} : sampling.mouseInteraction;
    const handlers = [];
    let currentPointerType = null;
    const getHandler = (eventKey) => {
      return (event) => {
        const target = getEventTarget(event);
        if (isBlocked(target, blockClass, blockSelector, true)) {
          return;
        }
        let pointerType = null;
        let thisEventKey = eventKey;
        if ("pointerType" in event) {
          switch (event.pointerType) {
            case "mouse":
              pointerType = PointerTypes.Mouse;
              break;
            case "touch":
              pointerType = PointerTypes.Touch;
              break;
            case "pen":
              pointerType = PointerTypes.Pen;
              break;
          }
          if (pointerType === PointerTypes.Touch) {
            if (MouseInteractions[eventKey] === MouseInteractions.MouseDown) {
              thisEventKey = "TouchStart";
            } else if (MouseInteractions[eventKey] === MouseInteractions.MouseUp) {
              thisEventKey = "TouchEnd";
            }
          } else if (pointerType === PointerTypes.Pen);
        } else if (legacy_isTouchEvent(event)) {
          pointerType = PointerTypes.Touch;
        }
        if (pointerType !== null) {
          currentPointerType = pointerType;
          if (
            (thisEventKey.startsWith("Touch") && pointerType === PointerTypes.Touch) ||
            (thisEventKey.startsWith("Mouse") && pointerType === PointerTypes.Mouse)
          ) {
            pointerType = null;
          }
        } else if (MouseInteractions[eventKey] === MouseInteractions.Click) {
          pointerType = currentPointerType;
          currentPointerType = null;
        }
        const e = legacy_isTouchEvent(event) ? event.changedTouches[0] : event;
        if (!e) {
          return;
        }
        const id = mirror.getId(target);
        const { clientX, clientY } = e;
        callbackWrapper(mouseInteractionCb)(
          Object.assign(
            { type: MouseInteractions[thisEventKey], id, x: clientX, y: clientY },
            pointerType !== null && { pointerType }
          )
        );
      };
    };
    Object.keys(MouseInteractions)
      .filter((key) => Number.isNaN(Number(key)) && !key.endsWith("_Departed") && disableMap[key] !== false)
      .forEach((eventKey) => {
        let eventName = toLowerCase(eventKey);
        const handler = getHandler(eventKey);
        if (window.PointerEvent) {
          switch (MouseInteractions[eventKey]) {
            case MouseInteractions.MouseDown:
            case MouseInteractions.MouseUp:
              eventName = eventName.replace("mouse", "pointer");
              break;
            case MouseInteractions.TouchStart:
            case MouseInteractions.TouchEnd:
              return;
          }
        }
        handlers.push(on(eventName, handler, doc));
      });
    return callbackWrapper(() => {
      handlers.forEach((h) => h());
    });
  }
  function initScrollObserver({ scrollCb, doc, mirror, blockClass, blockSelector, sampling }) {
    const updatePosition = callbackWrapper(
      throttle(
        callbackWrapper((evt) => {
          const target = getEventTarget(evt);
          if (!target || isBlocked(target, blockClass, blockSelector, true)) {
            return;
          }
          const id = mirror.getId(target);
          if (target === doc && doc.defaultView) {
            const scrollLeftTop = getWindowScroll(doc.defaultView);
            scrollCb({
              id,
              x: scrollLeftTop.left,
              y: scrollLeftTop.top,
            });
          } else {
            scrollCb({
              id,
              x: target.scrollLeft,
              y: target.scrollTop,
            });
          }
        }),
        sampling.scroll || 100
      )
    );
    return on("scroll", updatePosition, doc);
  }
  function initViewportResizeObserver({ viewportResizeCb }, { win }) {
    let lastH = -1;
    let lastW = -1;
    const updateDimension = callbackWrapper(
      throttle(
        callbackWrapper(() => {
          const height = getWindowHeight();
          const width = getWindowWidth();
          if (lastH !== height || lastW !== width) {
            viewportResizeCb({
              width: Number(width),
              height: Number(height),
            });
            lastH = height;
            lastW = width;
          }
        }),
        200
      )
    );
    return on("resize", updateDimension, win);
  }
  function wrapEventWithUserTriggeredFlag(v, enable) {
    const value = Object.assign({}, v);
    if (!enable) delete value.userTriggered;
    return value;
  }
  const INPUT_TAGS = ["INPUT", "TEXTAREA", "SELECT"];
  const lastInputValueMap = new WeakMap();
  function initInputObserver({
    inputCb,
    doc,
    mirror,
    blockClass,
    blockSelector,
    ignoreClass,
    ignoreSelector,
    maskInputOptions,
    maskInputFn,
    sampling,
    userTriggeredOnInput,
  }) {
    function eventHandler(event) {
      let target = getEventTarget(event);
      const userTriggered = event.isTrusted;
      const tagName = target && target.tagName;
      if (target && tagName === "OPTION") {
        target = target.parentElement;
      }
      if (
        !target ||
        !tagName ||
        INPUT_TAGS.indexOf(tagName) < 0 ||
        isBlocked(target, blockClass, blockSelector, true)
      ) {
        return;
      }
      if (target.classList.contains(ignoreClass) || (ignoreSelector && target.matches(ignoreSelector))) {
        return;
      }
      let text = target.value;
      let isChecked = false;
      const type = getInputType(target) || "";
      if (type === "radio" || type === "checkbox") {
        isChecked = target.checked;
      } else if (maskInputOptions[tagName.toLowerCase()] || maskInputOptions[type]) {
        text = maskInputValue({
          element: target,
          maskInputOptions,
          tagName,
          type,
          value: text,
          maskInputFn,
        });
      }
      cbWithDedup(
        target,
        callbackWrapper(wrapEventWithUserTriggeredFlag)({ text, isChecked, userTriggered }, userTriggeredOnInput)
      );
      const name = target.name;
      if (type === "radio" && name && isChecked) {
        doc.querySelectorAll(`input[type="radio"][name="${name}"]`).forEach((el) => {
          if (el !== target) {
            cbWithDedup(
              el,
              callbackWrapper(wrapEventWithUserTriggeredFlag)(
                {
                  text: el.value,
                  isChecked: !isChecked,
                  userTriggered: false,
                },
                userTriggeredOnInput
              )
            );
          }
        });
      }
    }
    function cbWithDedup(target, v) {
      const lastInputValue = lastInputValueMap.get(target);
      if (!lastInputValue || lastInputValue.text !== v.text || lastInputValue.isChecked !== v.isChecked) {
        lastInputValueMap.set(target, v);
        const id = mirror.getId(target);
        callbackWrapper(inputCb)(Object.assign(Object.assign({}, v), { id }));
      }
    }
    const events = sampling.input === "last" ? ["change"] : ["input", "change"];
    const handlers = events.map((eventName) => on(eventName, callbackWrapper(eventHandler), doc));
    const currentWindow = doc.defaultView;
    if (!currentWindow) {
      return () => {
        handlers.forEach((h) => h());
      };
    }
    const propertyDescriptor = currentWindow.Object.getOwnPropertyDescriptor(
      currentWindow.HTMLInputElement.prototype,
      "value"
    );
    const hookProperties = [
      [currentWindow.HTMLInputElement.prototype, "value"],
      [currentWindow.HTMLInputElement.prototype, "checked"],
      [currentWindow.HTMLSelectElement.prototype, "value"],
      [currentWindow.HTMLTextAreaElement.prototype, "value"],
      [currentWindow.HTMLSelectElement.prototype, "selectedIndex"],
      [currentWindow.HTMLOptionElement.prototype, "selected"],
    ];
    if (propertyDescriptor && propertyDescriptor.set) {
      handlers.push(
        ...hookProperties.map((p) =>
          hookSetter(
            p[0],
            p[1],
            {
              set() {
                callbackWrapper(eventHandler)({
                  target: this,
                  isTrusted: false,
                });
              },
            },
            false,
            currentWindow
          )
        )
      );
    }
    return callbackWrapper(() => {
      handlers.forEach((h) => h());
    });
  }
  function getNestedCSSRulePositions(rule) {
    const positions = [];
    function recurse(childRule, pos) {
      if (
        (hasNestedCSSRule("CSSGroupingRule") && childRule.parentRule instanceof CSSGroupingRule) ||
        (hasNestedCSSRule("CSSMediaRule") && childRule.parentRule instanceof CSSMediaRule) ||
        (hasNestedCSSRule("CSSSupportsRule") && childRule.parentRule instanceof CSSSupportsRule) ||
        (hasNestedCSSRule("CSSConditionRule") && childRule.parentRule instanceof CSSConditionRule)
      ) {
        const rules = Array.from(childRule.parentRule.cssRules);
        const index = rules.indexOf(childRule);
        pos.unshift(index);
      } else if (childRule.parentStyleSheet) {
        const rules = Array.from(childRule.parentStyleSheet.cssRules);
        const index = rules.indexOf(childRule);
        pos.unshift(index);
      }
      return pos;
    }
    return recurse(rule, positions);
  }
  function getIdAndStyleId(sheet, mirror, styleMirror) {
    let id, styleId;
    if (!sheet) return {};
    if (sheet.ownerNode) id = mirror.getId(sheet.ownerNode);
    else styleId = styleMirror.getId(sheet);
    return {
      styleId,
      id,
    };
  }
  function initStyleSheetObserver({ styleSheetRuleCb, mirror, stylesheetManager }, { win }) {
    if (!win.CSSStyleSheet || !win.CSSStyleSheet.prototype) {
      return () => {};
    }
    const insertRule = win.CSSStyleSheet.prototype.insertRule;
    win.CSSStyleSheet.prototype.insertRule = new Proxy(insertRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [rule, index] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
        if ((id && id !== -1) || (styleId && styleId !== -1)) {
          styleSheetRuleCb({
            id,
            styleId,
            adds: [{ rule, index }],
          });
        }
        return target.apply(thisArg, argumentsList);
      }),
    });
    const deleteRule = win.CSSStyleSheet.prototype.deleteRule;
    win.CSSStyleSheet.prototype.deleteRule = new Proxy(deleteRule, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        const [index] = argumentsList;
        const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
        if ((id && id !== -1) || (styleId && styleId !== -1)) {
          styleSheetRuleCb({
            id,
            styleId,
            removes: [{ index }],
          });
        }
        return target.apply(thisArg, argumentsList);
      }),
    });
    let replace;
    if (win.CSSStyleSheet.prototype.replace) {
      replace = win.CSSStyleSheet.prototype.replace;
      win.CSSStyleSheet.prototype.replace = new Proxy(replace, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [text] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
          if ((id && id !== -1) || (styleId && styleId !== -1)) {
            styleSheetRuleCb({
              id,
              styleId,
              replace: text,
            });
          }
          return target.apply(thisArg, argumentsList);
        }),
      });
    }
    let replaceSync;
    if (win.CSSStyleSheet.prototype.replaceSync) {
      replaceSync = win.CSSStyleSheet.prototype.replaceSync;
      win.CSSStyleSheet.prototype.replaceSync = new Proxy(replaceSync, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [text] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg, mirror, stylesheetManager.styleMirror);
          if ((id && id !== -1) || (styleId && styleId !== -1)) {
            styleSheetRuleCb({
              id,
              styleId,
              replaceSync: text,
            });
          }
          return target.apply(thisArg, argumentsList);
        }),
      });
    }
    const supportedNestedCSSRuleTypes = {};
    if (canMonkeyPatchNestedCSSRule("CSSGroupingRule")) {
      supportedNestedCSSRuleTypes.CSSGroupingRule = win.CSSGroupingRule;
    } else {
      if (canMonkeyPatchNestedCSSRule("CSSMediaRule")) {
        supportedNestedCSSRuleTypes.CSSMediaRule = win.CSSMediaRule;
      }
      if (canMonkeyPatchNestedCSSRule("CSSConditionRule")) {
        supportedNestedCSSRuleTypes.CSSConditionRule = win.CSSConditionRule;
      }
      if (canMonkeyPatchNestedCSSRule("CSSSupportsRule")) {
        supportedNestedCSSRuleTypes.CSSSupportsRule = win.CSSSupportsRule;
      }
    }
    const unmodifiedFunctions = {};
    Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
      unmodifiedFunctions[typeKey] = {
        insertRule: type.prototype.insertRule,
        deleteRule: type.prototype.deleteRule,
      };
      type.prototype.insertRule = new Proxy(unmodifiedFunctions[typeKey].insertRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [rule, index] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror, stylesheetManager.styleMirror);
          if ((id && id !== -1) || (styleId && styleId !== -1)) {
            styleSheetRuleCb({
              id,
              styleId,
              adds: [
                {
                  rule,
                  index: [...getNestedCSSRulePositions(thisArg), index || 0],
                },
              ],
            });
          }
          return target.apply(thisArg, argumentsList);
        }),
      });
      type.prototype.deleteRule = new Proxy(unmodifiedFunctions[typeKey].deleteRule, {
        apply: callbackWrapper((target, thisArg, argumentsList) => {
          const [index] = argumentsList;
          const { id, styleId } = getIdAndStyleId(thisArg.parentStyleSheet, mirror, stylesheetManager.styleMirror);
          if ((id && id !== -1) || (styleId && styleId !== -1)) {
            styleSheetRuleCb({
              id,
              styleId,
              removes: [{ index: [...getNestedCSSRulePositions(thisArg), index] }],
            });
          }
          return target.apply(thisArg, argumentsList);
        }),
      });
    });
    return callbackWrapper(() => {
      win.CSSStyleSheet.prototype.insertRule = insertRule;
      win.CSSStyleSheet.prototype.deleteRule = deleteRule;
      replace && (win.CSSStyleSheet.prototype.replace = replace);
      replaceSync && (win.CSSStyleSheet.prototype.replaceSync = replaceSync);
      Object.entries(supportedNestedCSSRuleTypes).forEach(([typeKey, type]) => {
        type.prototype.insertRule = unmodifiedFunctions[typeKey].insertRule;
        type.prototype.deleteRule = unmodifiedFunctions[typeKey].deleteRule;
      });
    });
  }
  function initAdoptedStyleSheetObserver({ mirror, stylesheetManager }, host) {
    var _a, _b, _c;
    let hostId = null;
    if (host.nodeName === "#document") hostId = mirror.getId(host);
    else hostId = mirror.getId(host.host);
    const patchTarget =
      host.nodeName === "#document"
        ? (_a = host.defaultView) === null || _a === void 0
          ? void 0
          : _a.Document
        : (_c = (_b = host.ownerDocument) === null || _b === void 0 ? void 0 : _b.defaultView) === null || _c === void 0
        ? void 0
        : _c.ShadowRoot;
    const originalPropertyDescriptor = Object.getOwnPropertyDescriptor(
      patchTarget === null || patchTarget === void 0 ? void 0 : patchTarget.prototype,
      "adoptedStyleSheets"
    );
    if (hostId === null || hostId === -1 || !patchTarget || !originalPropertyDescriptor) return () => {};
    Object.defineProperty(host, "adoptedStyleSheets", {
      configurable: originalPropertyDescriptor.configurable,
      enumerable: originalPropertyDescriptor.enumerable,
      get() {
        var _a;
        return (_a = originalPropertyDescriptor.get) === null || _a === void 0 ? void 0 : _a.call(this);
      },
      set(sheets) {
        var _a;
        const result = (_a = originalPropertyDescriptor.set) === null || _a === void 0 ? void 0 : _a.call(this, sheets);
        if (hostId !== null && hostId !== -1) {
          try {
            stylesheetManager.adoptStyleSheets(sheets, hostId);
          } catch (e) {}
        }
        return result;
      },
    });
    return callbackWrapper(() => {
      Object.defineProperty(host, "adoptedStyleSheets", {
        configurable: originalPropertyDescriptor.configurable,
        enumerable: originalPropertyDescriptor.enumerable,
        get: originalPropertyDescriptor.get,
        set: originalPropertyDescriptor.set,
      });
    });
  }
  function initStyleDeclarationObserver(
    { styleDeclarationCb, mirror, ignoreCSSAttributes, stylesheetManager },
    { win }
  ) {
    const setProperty = win.CSSStyleDeclaration.prototype.setProperty;
    win.CSSStyleDeclaration.prototype.setProperty = new Proxy(setProperty, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        var _a;
        const [property, value, priority] = argumentsList;
        if (ignoreCSSAttributes.has(property)) {
          return setProperty.apply(thisArg, [property, value, priority]);
        }
        const { id, styleId } = getIdAndStyleId(
          (_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet,
          mirror,
          stylesheetManager.styleMirror
        );
        if ((id && id !== -1) || (styleId && styleId !== -1)) {
          styleDeclarationCb({
            id,
            styleId,
            set: {
              property,
              value,
              priority,
            },
            index: getNestedCSSRulePositions(thisArg.parentRule),
          });
        }
        return target.apply(thisArg, argumentsList);
      }),
    });
    const removeProperty = win.CSSStyleDeclaration.prototype.removeProperty;
    win.CSSStyleDeclaration.prototype.removeProperty = new Proxy(removeProperty, {
      apply: callbackWrapper((target, thisArg, argumentsList) => {
        var _a;
        const [property] = argumentsList;
        if (ignoreCSSAttributes.has(property)) {
          return removeProperty.apply(thisArg, [property]);
        }
        const { id, styleId } = getIdAndStyleId(
          (_a = thisArg.parentRule) === null || _a === void 0 ? void 0 : _a.parentStyleSheet,
          mirror,
          stylesheetManager.styleMirror
        );
        if ((id && id !== -1) || (styleId && styleId !== -1)) {
          styleDeclarationCb({
            id,
            styleId,
            remove: {
              property,
            },
            index: getNestedCSSRulePositions(thisArg.parentRule),
          });
        }
        return target.apply(thisArg, argumentsList);
      }),
    });
    return callbackWrapper(() => {
      win.CSSStyleDeclaration.prototype.setProperty = setProperty;
      win.CSSStyleDeclaration.prototype.removeProperty = removeProperty;
    });
  }
  function initMediaInteractionObserver({ mediaInteractionCb, blockClass, blockSelector, mirror, sampling, doc }) {
    const handler = callbackWrapper((type) =>
      throttle(
        callbackWrapper((event) => {
          const target = getEventTarget(event);
          if (!target || isBlocked(target, blockClass, blockSelector, true)) {
            return;
          }
          const { currentTime, volume, muted, playbackRate } = target;
          mediaInteractionCb({
            type,
            id: mirror.getId(target),
            currentTime,
            volume,
            muted,
            playbackRate,
          });
        }),
        sampling.media || 500
      )
    );
    const handlers = [
      on("play", handler(0), doc),
      on("pause", handler(1), doc),
      on("seeked", handler(2), doc),
      on("volumechange", handler(3), doc),
      on("ratechange", handler(4), doc),
    ];
    return callbackWrapper(() => {
      handlers.forEach((h) => h());
    });
  }
  function initFontObserver({ fontCb, doc }) {
    const win = doc.defaultView;
    if (!win) {
      return () => {};
    }
    const handlers = [];
    const fontMap = new WeakMap();
    const originalFontFace = win.FontFace;
    win.FontFace = function FontFace(family, source, descriptors) {
      const fontFace = new originalFontFace(family, source, descriptors);
      fontMap.set(fontFace, {
        family,
        buffer: typeof source !== "string",
        descriptors,
        fontSource: typeof source === "string" ? source : JSON.stringify(Array.from(new Uint8Array(source))),
      });
      return fontFace;
    };
    const restoreHandler = patch(doc.fonts, "add", function (original) {
      return function (fontFace) {
        setTimeout(
          callbackWrapper(() => {
            const p = fontMap.get(fontFace);
            if (p) {
              fontCb(p);
              fontMap.delete(fontFace);
            }
          }),
          0
        );
        return original.apply(this, [fontFace]);
      };
    });
    handlers.push(() => {
      win.FontFace = originalFontFace;
    });
    handlers.push(restoreHandler);
    return callbackWrapper(() => {
      handlers.forEach((h) => h());
    });
  }
  function initSelectionObserver(param) {
    const { doc, mirror, blockClass, blockSelector, selectionCb } = param;
    let collapsed = true;
    const updateSelection = callbackWrapper(() => {
      const selection = doc.getSelection();
      if (!selection || (collapsed && (selection === null || selection === void 0 ? void 0 : selection.isCollapsed)))
        return;
      collapsed = selection.isCollapsed || false;
      const ranges = [];
      const count = selection.rangeCount || 0;
      for (let i = 0; i < count; i++) {
        const range = selection.getRangeAt(i);
        const { startContainer, startOffset, endContainer, endOffset } = range;
        const blocked =
          isBlocked(startContainer, blockClass, blockSelector, true) ||
          isBlocked(endContainer, blockClass, blockSelector, true);
        if (blocked) continue;
        ranges.push({
          start: mirror.getId(startContainer),
          startOffset,
          end: mirror.getId(endContainer),
          endOffset,
        });
      }
      selectionCb({ ranges });
    });
    updateSelection();
    return on("selectionchange", updateSelection);
  }
  function initCustomElementObserver({ doc, customElementCb }) {
    const win = doc.defaultView;
    if (!win || !win.customElements) return () => {};
    const restoreHandler = patch(win.customElements, "define", function (original) {
      return function (name, constructor, options) {
        try {
          customElementCb({
            define: {
              name,
            },
          });
        } catch (e) {}
        return original.apply(this, [name, constructor, options]);
      };
    });
    return restoreHandler;
  }
  function mergeHooks(o, hooks) {
    const {
      mutationCb,
      mousemoveCb,
      mouseInteractionCb,
      scrollCb,
      viewportResizeCb,
      inputCb,
      mediaInteractionCb,
      styleSheetRuleCb,
      styleDeclarationCb,
      canvasMutationCb,
      fontCb,
      selectionCb,
      customElementCb,
    } = o;
    o.mutationCb = (...p) => {
      if (hooks.mutation) {
        hooks.mutation(...p);
      }
      mutationCb(...p);
    };
    o.mousemoveCb = (...p) => {
      if (hooks.mousemove) {
        hooks.mousemove(...p);
      }
      mousemoveCb(...p);
    };
    o.mouseInteractionCb = (...p) => {
      if (hooks.mouseInteraction) {
        hooks.mouseInteraction(...p);
      }
      mouseInteractionCb(...p);
    };
    o.scrollCb = (...p) => {
      if (hooks.scroll) {
        hooks.scroll(...p);
      }
      scrollCb(...p);
    };
    o.viewportResizeCb = (...p) => {
      if (hooks.viewportResize) {
        hooks.viewportResize(...p);
      }
      viewportResizeCb(...p);
    };
    o.inputCb = (...p) => {
      if (hooks.input) {
        hooks.input(...p);
      }
      inputCb(...p);
    };
    o.mediaInteractionCb = (...p) => {
      if (hooks.mediaInteaction) {
        hooks.mediaInteaction(...p);
      }
      mediaInteractionCb(...p);
    };
    o.styleSheetRuleCb = (...p) => {
      if (hooks.styleSheetRule) {
        hooks.styleSheetRule(...p);
      }
      styleSheetRuleCb(...p);
    };
    o.styleDeclarationCb = (...p) => {
      if (hooks.styleDeclaration) {
        hooks.styleDeclaration(...p);
      }
      styleDeclarationCb(...p);
    };
    o.canvasMutationCb = (...p) => {
      if (hooks.canvasMutation) {
        hooks.canvasMutation(...p);
      }
      canvasMutationCb(...p);
    };
    o.fontCb = (...p) => {
      if (hooks.font) {
        hooks.font(...p);
      }
      fontCb(...p);
    };
    o.selectionCb = (...p) => {
      if (hooks.selection) {
        hooks.selection(...p);
      }
      selectionCb(...p);
    };
    o.customElementCb = (...c) => {
      if (hooks.customElement) {
        hooks.customElement(...c);
      }
      customElementCb(...c);
    };
  }
  function initObservers(o, hooks = {}) {
    const currentWindow = o.doc.defaultView;
    if (!currentWindow) {
      return () => {};
    }
    mergeHooks(o, hooks);
    const mutationObserver = initMutationObserver(o, o.doc);
    const mousemoveHandler = initMoveObserver(o);
    const mouseInteractionHandler = initMouseInteractionObserver(o);
    const scrollHandler = initScrollObserver(o);
    const viewportResizeHandler = initViewportResizeObserver(o, {
      win: currentWindow,
    });
    const inputHandler = initInputObserver(o);
    const mediaInteractionHandler = initMediaInteractionObserver(o);
    const styleSheetObserver = initStyleSheetObserver(o, { win: currentWindow });
    const adoptedStyleSheetObserver = initAdoptedStyleSheetObserver(o, o.doc);
    const styleDeclarationObserver = initStyleDeclarationObserver(o, {
      win: currentWindow,
    });
    const fontObserver = o.collectFonts ? initFontObserver(o) : () => {};
    const selectionObserver = initSelectionObserver(o);
    const customElementObserver = initCustomElementObserver(o);
    const pluginHandlers = [];
    for (const plugin of o.plugins) {
      pluginHandlers.push(plugin.observer(plugin.callback, currentWindow, plugin.options));
    }
    return callbackWrapper(() => {
      mutationBuffers.forEach((b) => b.reset());
      mutationObserver.disconnect();
      mousemoveHandler();
      mouseInteractionHandler();
      scrollHandler();
      viewportResizeHandler();
      inputHandler();
      mediaInteractionHandler();
      styleSheetObserver();
      adoptedStyleSheetObserver();
      styleDeclarationObserver();
      fontObserver();
      selectionObserver();
      customElementObserver();
      pluginHandlers.forEach((h) => h());
    });
  }
  function hasNestedCSSRule(prop) {
    return typeof window[prop] !== "undefined";
  }
  function canMonkeyPatchNestedCSSRule(prop) {
    return Boolean(
      typeof window[prop] !== "undefined" &&
        window[prop].prototype &&
        "insertRule" in window[prop].prototype &&
        "deleteRule" in window[prop].prototype
    );
  }

  class CrossOriginIframeMirror {
    constructor(generateIdFn) {
      this.generateIdFn = generateIdFn;
      this.iframeIdToRemoteIdMap = new WeakMap();
      this.iframeRemoteIdToIdMap = new WeakMap();
    }
    getId(iframe, remoteId, idToRemoteMap, remoteToIdMap) {
      const idToRemoteIdMap = idToRemoteMap || this.getIdToRemoteIdMap(iframe);
      const remoteIdToIdMap = remoteToIdMap || this.getRemoteIdToIdMap(iframe);
      let id = idToRemoteIdMap.get(remoteId);
      if (!id) {
        id = this.generateIdFn();
        idToRemoteIdMap.set(remoteId, id);
        remoteIdToIdMap.set(id, remoteId);
      }
      return id;
    }
    getIds(iframe, remoteId) {
      const idToRemoteIdMap = this.getIdToRemoteIdMap(iframe);
      const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
      return remoteId.map((id) => this.getId(iframe, id, idToRemoteIdMap, remoteIdToIdMap));
    }
    getRemoteId(iframe, id, map) {
      const remoteIdToIdMap = map || this.getRemoteIdToIdMap(iframe);
      if (typeof id !== "number") return id;
      const remoteId = remoteIdToIdMap.get(id);
      if (!remoteId) return -1;
      return remoteId;
    }
    getRemoteIds(iframe, ids) {
      const remoteIdToIdMap = this.getRemoteIdToIdMap(iframe);
      return ids.map((id) => this.getRemoteId(iframe, id, remoteIdToIdMap));
    }
    reset(iframe) {
      if (!iframe) {
        this.iframeIdToRemoteIdMap = new WeakMap();
        this.iframeRemoteIdToIdMap = new WeakMap();
        return;
      }
      this.iframeIdToRemoteIdMap.delete(iframe);
      this.iframeRemoteIdToIdMap.delete(iframe);
    }
    getIdToRemoteIdMap(iframe) {
      let idToRemoteIdMap = this.iframeIdToRemoteIdMap.get(iframe);
      if (!idToRemoteIdMap) {
        idToRemoteIdMap = new Map();
        this.iframeIdToRemoteIdMap.set(iframe, idToRemoteIdMap);
      }
      return idToRemoteIdMap;
    }
    getRemoteIdToIdMap(iframe) {
      let remoteIdToIdMap = this.iframeRemoteIdToIdMap.get(iframe);
      if (!remoteIdToIdMap) {
        remoteIdToIdMap = new Map();
        this.iframeRemoteIdToIdMap.set(iframe, remoteIdToIdMap);
      }
      return remoteIdToIdMap;
    }
  }

  class IframeManager {
    constructor(options) {
      this.iframes = new WeakMap();
      this.crossOriginIframeMap = new WeakMap();
      this.crossOriginIframeMirror = new CrossOriginIframeMirror(genId);
      this.crossOriginIframeRootIdMap = new WeakMap();
      this.mutationCb = options.mutationCb;
      this.wrappedEmit = options.wrappedEmit;
      this.stylesheetManager = options.stylesheetManager;
      this.recordCrossOriginIframes = options.recordCrossOriginIframes;
      this.crossOriginIframeStyleMirror = new CrossOriginIframeMirror(
        this.stylesheetManager.styleMirror.generateId.bind(this.stylesheetManager.styleMirror)
      );
      this.mirror = options.mirror;
      if (this.recordCrossOriginIframes) {
        window.addEventListener("message", this.handleMessage.bind(this));
      }
    }
    addIframe(iframeEl) {
      this.iframes.set(iframeEl, true);
      if (iframeEl.contentWindow) this.crossOriginIframeMap.set(iframeEl.contentWindow, iframeEl);
    }
    addLoadListener(cb) {
      this.loadListener = cb;
    }
    attachIframe(iframeEl, childSn) {
      var _a;
      this.mutationCb({
        adds: [
          {
            parentId: this.mirror.getId(iframeEl),
            nextId: null,
            node: childSn,
          },
        ],
        removes: [],
        texts: [],
        attributes: [],
        isAttachIframe: true,
      });
      (_a = this.loadListener) === null || _a === void 0 ? void 0 : _a.call(this, iframeEl);
      if (
        iframeEl.contentDocument &&
        iframeEl.contentDocument.adoptedStyleSheets &&
        iframeEl.contentDocument.adoptedStyleSheets.length > 0
      )
        this.stylesheetManager.adoptStyleSheets(
          iframeEl.contentDocument.adoptedStyleSheets,
          this.mirror.getId(iframeEl.contentDocument)
        );
    }
    handleMessage(message) {
      const crossOriginMessageEvent = message;
      if (
        crossOriginMessageEvent.data.type !== "rrweb" ||
        crossOriginMessageEvent.origin !== crossOriginMessageEvent.data.origin
      )
        return;
      const iframeSourceWindow = message.source;
      if (!iframeSourceWindow) return;
      const iframeEl = this.crossOriginIframeMap.get(message.source);
      if (!iframeEl) return;
      const transformedEvent = this.transformCrossOriginEvent(iframeEl, crossOriginMessageEvent.data.event);
      if (transformedEvent) this.wrappedEmit(transformedEvent, crossOriginMessageEvent.data.isCheckout);
    }
    transformCrossOriginEvent(iframeEl, e) {
      var _a;
      switch (e.type) {
        case EventType.FullSnapshot: {
          this.crossOriginIframeMirror.reset(iframeEl);
          this.crossOriginIframeStyleMirror.reset(iframeEl);
          this.replaceIdOnNode(e.data.node, iframeEl);
          const rootId = e.data.node.id;
          this.crossOriginIframeRootIdMap.set(iframeEl, rootId);
          this.patchRootIdOnNode(e.data.node, rootId);
          return {
            timestamp: e.timestamp,
            type: EventType.IncrementalSnapshot,
            data: {
              source: IncrementalSource.Mutation,
              adds: [
                {
                  parentId: this.mirror.getId(iframeEl),
                  nextId: null,
                  node: e.data.node,
                },
              ],
              removes: [],
              texts: [],
              attributes: [],
              isAttachIframe: true,
            },
          };
        }
        case EventType.Meta:
        case EventType.Load:
        case EventType.DomContentLoaded: {
          return false;
        }
        case EventType.Plugin: {
          return e;
        }
        case EventType.Custom: {
          this.replaceIds(e.data.payload, iframeEl, ["id", "parentId", "previousId", "nextId"]);
          return e;
        }
        case EventType.IncrementalSnapshot: {
          switch (e.data.source) {
            case IncrementalSource.Mutation: {
              e.data.adds.forEach((n) => {
                this.replaceIds(n, iframeEl, ["parentId", "nextId", "previousId"]);
                this.replaceIdOnNode(n.node, iframeEl);
                const rootId = this.crossOriginIframeRootIdMap.get(iframeEl);
                rootId && this.patchRootIdOnNode(n.node, rootId);
              });
              e.data.removes.forEach((n) => {
                this.replaceIds(n, iframeEl, ["parentId", "id"]);
              });
              e.data.attributes.forEach((n) => {
                this.replaceIds(n, iframeEl, ["id"]);
              });
              e.data.texts.forEach((n) => {
                this.replaceIds(n, iframeEl, ["id"]);
              });
              return e;
            }
            case IncrementalSource.Drag:
            case IncrementalSource.TouchMove:
            case IncrementalSource.MouseMove: {
              e.data.positions.forEach((p) => {
                this.replaceIds(p, iframeEl, ["id"]);
              });
              return e;
            }
            case IncrementalSource.ViewportResize: {
              return false;
            }
            case IncrementalSource.MediaInteraction:
            case IncrementalSource.MouseInteraction:
            case IncrementalSource.Scroll:
            case IncrementalSource.CanvasMutation:
            case IncrementalSource.Input: {
              this.replaceIds(e.data, iframeEl, ["id"]);
              return e;
            }
            case IncrementalSource.StyleSheetRule:
            case IncrementalSource.StyleDeclaration: {
              this.replaceIds(e.data, iframeEl, ["id"]);
              this.replaceStyleIds(e.data, iframeEl, ["styleId"]);
              return e;
            }
            case IncrementalSource.Font: {
              return e;
            }
            case IncrementalSource.Selection: {
              e.data.ranges.forEach((range) => {
                this.replaceIds(range, iframeEl, ["start", "end"]);
              });
              return e;
            }
            case IncrementalSource.AdoptedStyleSheet: {
              this.replaceIds(e.data, iframeEl, ["id"]);
              this.replaceStyleIds(e.data, iframeEl, ["styleIds"]);
              (_a = e.data.styles) === null || _a === void 0
                ? void 0
                : _a.forEach((style) => {
                    this.replaceStyleIds(style, iframeEl, ["styleId"]);
                  });
              return e;
            }
          }
        }
      }
      return false;
    }
    replace(iframeMirror, obj, iframeEl, keys) {
      for (const key of keys) {
        if (!Array.isArray(obj[key]) && typeof obj[key] !== "number") continue;
        if (Array.isArray(obj[key])) {
          obj[key] = iframeMirror.getIds(iframeEl, obj[key]);
        } else {
          obj[key] = iframeMirror.getId(iframeEl, obj[key]);
        }
      }
      return obj;
    }
    replaceIds(obj, iframeEl, keys) {
      return this.replace(this.crossOriginIframeMirror, obj, iframeEl, keys);
    }
    replaceStyleIds(obj, iframeEl, keys) {
      return this.replace(this.crossOriginIframeStyleMirror, obj, iframeEl, keys);
    }
    replaceIdOnNode(node, iframeEl) {
      this.replaceIds(node, iframeEl, ["id", "rootId"]);
      if ("childNodes" in node) {
        node.childNodes.forEach((child) => {
          this.replaceIdOnNode(child, iframeEl);
        });
      }
    }
    patchRootIdOnNode(node, rootId) {
      if (node.type !== NodeType.Document && !node.rootId) node.rootId = rootId;
      if ("childNodes" in node) {
        node.childNodes.forEach((child) => {
          this.patchRootIdOnNode(child, rootId);
        });
      }
    }
  }

  class ShadowDomManager {
    constructor(options) {
      this.shadowDoms = new WeakSet();
      this.restoreHandlers = [];
      this.mutationCb = options.mutationCb;
      this.scrollCb = options.scrollCb;
      this.bypassOptions = options.bypassOptions;
      this.mirror = options.mirror;
      this.init();
    }
    init() {
      this.reset();
      this.patchAttachShadow(Element, document);
    }
    addShadowRoot(shadowRoot, doc) {
      if (!isNativeShadowDom(shadowRoot)) return;
      if (this.shadowDoms.has(shadowRoot)) return;
      this.shadowDoms.add(shadowRoot);
      const observer = initMutationObserver(
        Object.assign(Object.assign({}, this.bypassOptions), {
          doc,
          mutationCb: this.mutationCb,
          mirror: this.mirror,
          shadowDomManager: this,
        }),
        shadowRoot
      );
      this.restoreHandlers.push(() => observer.disconnect());
      this.restoreHandlers.push(
        initScrollObserver(
          Object.assign(Object.assign({}, this.bypassOptions), {
            scrollCb: this.scrollCb,
            doc: shadowRoot,
            mirror: this.mirror,
          })
        )
      );
      setTimeout(() => {
        if (shadowRoot.adoptedStyleSheets && shadowRoot.adoptedStyleSheets.length > 0)
          this.bypassOptions.stylesheetManager.adoptStyleSheets(
            shadowRoot.adoptedStyleSheets,
            this.mirror.getId(shadowRoot.host)
          );
        this.restoreHandlers.push(
          initAdoptedStyleSheetObserver(
            {
              mirror: this.mirror,
              stylesheetManager: this.bypassOptions.stylesheetManager,
            },
            shadowRoot
          )
        );
      }, 0);
    }
    observeAttachShadow(iframeElement) {
      if (!iframeElement.contentWindow || !iframeElement.contentDocument) return;
      this.patchAttachShadow(iframeElement.contentWindow.Element, iframeElement.contentDocument);
    }
    patchAttachShadow(element, doc) {
      const manager = this;
      this.restoreHandlers.push(
        patch(element.prototype, "attachShadow", function (original) {
          return function (option) {
            const shadowRoot = original.call(this, option);
            if (this.shadowRoot && inDom(this)) manager.addShadowRoot(this.shadowRoot, doc);
            return shadowRoot;
          };
        })
      );
    }
    reset() {
      this.restoreHandlers.forEach((handler) => {
        try {
          handler();
        } catch (e) {}
      });
      this.restoreHandlers = [];
      this.shadowDoms = new WeakSet();
    }
  }

  /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

  function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
      for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
      }
    return t;
  }

  function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  }

  /*
   * base64-arraybuffer 1.0.1 <https://github.com/niklasvh/base64-arraybuffer>
   * Copyright (c) 2021 Niklas von Hertzen <https://hertzen.com>
   * Released under MIT License
   */
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  // Use a lookup table to find the index.
  var lookup = typeof Uint8Array === "undefined" ? [] : new Uint8Array(256);
  for (var i = 0; i < chars.length; i++) {
    lookup[chars.charCodeAt(i)] = i;
  }
  var encode = function (arraybuffer) {
    var bytes = new Uint8Array(arraybuffer),
      i,
      len = bytes.length,
      base64 = "";
    for (i = 0; i < len; i += 3) {
      base64 += chars[bytes[i] >> 2];
      base64 += chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
      base64 += chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
      base64 += chars[bytes[i + 2] & 63];
    }
    if (len % 3 === 2) {
      base64 = base64.substring(0, base64.length - 1) + "=";
    } else if (len % 3 === 1) {
      base64 = base64.substring(0, base64.length - 2) + "==";
    }
    return base64;
  };

  const canvasVarMap = new Map();
  function variableListFor(ctx, ctor) {
    let contextMap = canvasVarMap.get(ctx);
    if (!contextMap) {
      contextMap = new Map();
      canvasVarMap.set(ctx, contextMap);
    }
    if (!contextMap.has(ctor)) {
      contextMap.set(ctor, []);
    }
    return contextMap.get(ctor);
  }
  const saveWebGLVar = (value, win, ctx) => {
    if (!value || !(isInstanceOfWebGLObject(value, win) || typeof value === "object")) return;
    const name = value.constructor.name;
    const list = variableListFor(ctx, name);
    let index = list.indexOf(value);
    if (index === -1) {
      index = list.length;
      list.push(value);
    }
    return index;
  };
  function serializeArg(value, win, ctx) {
    if (value instanceof Array) {
      return value.map((arg) => serializeArg(arg, win, ctx));
    } else if (value === null) {
      return value;
    } else if (
      value instanceof Float32Array ||
      value instanceof Float64Array ||
      value instanceof Int32Array ||
      value instanceof Uint32Array ||
      value instanceof Uint8Array ||
      value instanceof Uint16Array ||
      value instanceof Int16Array ||
      value instanceof Int8Array ||
      value instanceof Uint8ClampedArray
    ) {
      const name = value.constructor.name;
      return {
        rr_type: name,
        args: [Object.values(value)],
      };
    } else if (value instanceof ArrayBuffer) {
      const name = value.constructor.name;
      const base64 = encode(value);
      return {
        rr_type: name,
        base64,
      };
    } else if (value instanceof DataView) {
      const name = value.constructor.name;
      return {
        rr_type: name,
        args: [serializeArg(value.buffer, win, ctx), value.byteOffset, value.byteLength],
      };
    } else if (value instanceof HTMLImageElement) {
      const name = value.constructor.name;
      const { src } = value;
      return {
        rr_type: name,
        src,
      };
    } else if (value instanceof HTMLCanvasElement) {
      const name = "HTMLImageElement";
      const src = value.toDataURL();
      return {
        rr_type: name,
        src,
      };
    } else if (value instanceof ImageData) {
      const name = value.constructor.name;
      return {
        rr_type: name,
        args: [serializeArg(value.data, win, ctx), value.width, value.height],
      };
    } else if (isInstanceOfWebGLObject(value, win) || typeof value === "object") {
      const name = value.constructor.name;
      const index = saveWebGLVar(value, win, ctx);
      return {
        rr_type: name,
        index: index,
      };
    }
    return value;
  }
  const serializeArgs = (args, win, ctx) => {
    return [...args].map((arg) => serializeArg(arg, win, ctx));
  };
  const isInstanceOfWebGLObject = (value, win) => {
    const webGLConstructorNames = [
      "WebGLActiveInfo",
      "WebGLBuffer",
      "WebGLFramebuffer",
      "WebGLProgram",
      "WebGLRenderbuffer",
      "WebGLShader",
      "WebGLShaderPrecisionFormat",
      "WebGLTexture",
      "WebGLUniformLocation",
      "WebGLVertexArrayObject",
      "WebGLVertexArrayObjectOES",
    ];
    const supportedWebGLConstructorNames = webGLConstructorNames.filter((name) => typeof win[name] === "function");
    return Boolean(supportedWebGLConstructorNames.find((name) => value instanceof win[name]));
  };

  function initCanvas2DMutationObserver(cb, win, blockClass, blockSelector) {
    const handlers = [];
    const props2D = Object.getOwnPropertyNames(win.CanvasRenderingContext2D.prototype);
    for (const prop of props2D) {
      try {
        if (typeof win.CanvasRenderingContext2D.prototype[prop] !== "function") {
          continue;
        }
        const restoreHandler = patch(win.CanvasRenderingContext2D.prototype, prop, function (original) {
          return function (...args) {
            if (!isBlocked(this.canvas, blockClass, blockSelector, true)) {
              setTimeout(() => {
                const recordArgs = serializeArgs([...args], win, this);
                cb(this.canvas, {
                  type: CanvasContext["2D"],
                  property: prop,
                  args: recordArgs,
                });
              }, 0);
            }
            return original.apply(this, args);
          };
        });
        handlers.push(restoreHandler);
      } catch (_a) {
        const hookHandler = hookSetter(win.CanvasRenderingContext2D.prototype, prop, {
          set(v) {
            cb(this.canvas, {
              type: CanvasContext["2D"],
              property: prop,
              args: [v],
              setter: true,
            });
          },
        });
        handlers.push(hookHandler);
      }
    }
    return () => {
      handlers.forEach((h) => h());
    };
  }

  function getNormalizedContextName(contextType) {
    return contextType === "experimental-webgl" ? "webgl" : contextType;
  }
  function initCanvasContextObserver(win, blockClass, blockSelector, setPreserveDrawingBufferToTrue) {
    const handlers = [];
    try {
      const restoreHandler = patch(win.HTMLCanvasElement.prototype, "getContext", function (original) {
        return function (contextType, ...args) {
          if (!isBlocked(this, blockClass, blockSelector, true)) {
            const ctxName = getNormalizedContextName(contextType);
            if (!("__context" in this)) this.__context = ctxName;
            if (setPreserveDrawingBufferToTrue && ["webgl", "webgl2"].includes(ctxName)) {
              if (args[0] && typeof args[0] === "object") {
                const contextAttributes = args[0];
                if (!contextAttributes.preserveDrawingBuffer) {
                  contextAttributes.preserveDrawingBuffer = true;
                }
              } else {
                args.splice(0, 1, {
                  preserveDrawingBuffer: true,
                });
              }
            }
          }
          return original.apply(this, [contextType, ...args]);
        };
      });
      handlers.push(restoreHandler);
    } catch (_a) {
      console.error("failed to patch HTMLCanvasElement.prototype.getContext");
    }
    return () => {
      handlers.forEach((h) => h());
    };
  }

  function patchGLPrototype(prototype, type, cb, blockClass, blockSelector, mirror, win) {
    const handlers = [];
    const props = Object.getOwnPropertyNames(prototype);
    for (const prop of props) {
      if (["isContextLost", "canvas", "drawingBufferWidth", "drawingBufferHeight"].includes(prop)) {
        continue;
      }
      try {
        if (typeof prototype[prop] !== "function") {
          continue;
        }
        const restoreHandler = patch(prototype, prop, function (original) {
          return function (...args) {
            const result = original.apply(this, args);
            saveWebGLVar(result, win, this);
            if ("tagName" in this.canvas && !isBlocked(this.canvas, blockClass, blockSelector, true)) {
              const recordArgs = serializeArgs([...args], win, this);
              const mutation = {
                type,
                property: prop,
                args: recordArgs,
              };
              cb(this.canvas, mutation);
            }
            return result;
          };
        });
        handlers.push(restoreHandler);
      } catch (_a) {
        const hookHandler = hookSetter(prototype, prop, {
          set(v) {
            cb(this.canvas, {
              type,
              property: prop,
              args: [v],
              setter: true,
            });
          },
        });
        handlers.push(hookHandler);
      }
    }
    return handlers;
  }
  function initCanvasWebGLMutationObserver(cb, win, blockClass, blockSelector, mirror) {
    const handlers = [];
    handlers.push(
      ...patchGLPrototype(
        win.WebGLRenderingContext.prototype,
        CanvasContext.WebGL,
        cb,
        blockClass,
        blockSelector,
        mirror,
        win
      )
    );
    if (typeof win.WebGL2RenderingContext !== "undefined") {
      handlers.push(
        ...patchGLPrototype(
          win.WebGL2RenderingContext.prototype,
          CanvasContext.WebGL2,
          cb,
          blockClass,
          blockSelector,
          mirror,
          win
        )
      );
    }
    return () => {
      handlers.forEach((h) => h());
    };
  }

  function decodeBase64(base64, enableUnicode) {
    var binaryString = atob(base64);
    if (enableUnicode) {
      var binaryView = new Uint8Array(binaryString.length);
      for (var i = 0, n = binaryString.length; i < n; ++i) {
        binaryView[i] = binaryString.charCodeAt(i);
      }
      return String.fromCharCode.apply(null, new Uint16Array(binaryView.buffer));
    }
    return binaryString;
  }

  function createURL(base64, sourcemapArg, enableUnicodeArg) {
    var sourcemap = sourcemapArg === undefined ? null : sourcemapArg;
    var enableUnicode = enableUnicodeArg === undefined ? false : enableUnicodeArg;
    var source = decodeBase64(base64, enableUnicode);
    var start = source.indexOf("\n", 10) + 1;
    var body = source.substring(start) + (sourcemap ? "//# sourceMappingURL=" + sourcemap : "");
    var blob = new Blob([body], { type: "application/javascript" });
    return URL.createObjectURL(blob);
  }

  function createBase64WorkerFactory(base64, sourcemapArg, enableUnicodeArg) {
    var url;
    return function WorkerFactory(options) {
      url = url || createURL(base64, sourcemapArg, enableUnicodeArg);
      return new Worker(url, options);
    };
  }

  var WorkerFactory = createBase64WorkerFactory(
    "Lyogcm9sbHVwLXBsdWdpbi13ZWItd29ya2VyLWxvYWRlciAqLwooZnVuY3Rpb24gKCkgewogICAgJ3VzZSBzdHJpY3QnOwoKICAgIC8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKg0KICAgIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLg0KDQogICAgUGVybWlzc2lvbiB0byB1c2UsIGNvcHksIG1vZGlmeSwgYW5kL29yIGRpc3RyaWJ1dGUgdGhpcyBzb2Z0d2FyZSBmb3IgYW55DQogICAgcHVycG9zZSB3aXRoIG9yIHdpdGhvdXQgZmVlIGlzIGhlcmVieSBncmFudGVkLg0KDQogICAgVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEICJBUyBJUyIgQU5EIFRIRSBBVVRIT1IgRElTQ0xBSU1TIEFMTCBXQVJSQU5USUVTIFdJVEgNCiAgICBSRUdBUkQgVE8gVEhJUyBTT0ZUV0FSRSBJTkNMVURJTkcgQUxMIElNUExJRUQgV0FSUkFOVElFUyBPRiBNRVJDSEFOVEFCSUxJVFkNCiAgICBBTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsDQogICAgSU5ESVJFQ1QsIE9SIENPTlNFUVVFTlRJQUwgREFNQUdFUyBPUiBBTlkgREFNQUdFUyBXSEFUU09FVkVSIFJFU1VMVElORyBGUk9NDQogICAgTE9TUyBPRiBVU0UsIERBVEEgT1IgUFJPRklUUywgV0hFVEhFUiBJTiBBTiBBQ1RJT04gT0YgQ09OVFJBQ1QsIE5FR0xJR0VOQ0UgT1INCiAgICBPVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SDQogICAgUEVSRk9STUFOQ0UgT0YgVEhJUyBTT0ZUV0FSRS4NCiAgICAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiAqLw0KDQogICAgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikgew0KICAgICAgICBmdW5jdGlvbiBhZG9wdCh2YWx1ZSkgeyByZXR1cm4gdmFsdWUgaW5zdGFuY2VvZiBQID8gdmFsdWUgOiBuZXcgUChmdW5jdGlvbiAocmVzb2x2ZSkgeyByZXNvbHZlKHZhbHVlKTsgfSk7IH0NCiAgICAgICAgcmV0dXJuIG5ldyAoUCB8fCAoUCA9IFByb21pc2UpKShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7DQogICAgICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiByZWplY3RlZCh2YWx1ZSkgeyB0cnkgeyBzdGVwKGdlbmVyYXRvclsidGhyb3ciXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9DQogICAgICAgICAgICBmdW5jdGlvbiBzdGVwKHJlc3VsdCkgeyByZXN1bHQuZG9uZSA/IHJlc29sdmUocmVzdWx0LnZhbHVlKSA6IGFkb3B0KHJlc3VsdC52YWx1ZSkudGhlbihmdWxmaWxsZWQsIHJlamVjdGVkKTsgfQ0KICAgICAgICAgICAgc3RlcCgoZ2VuZXJhdG9yID0gZ2VuZXJhdG9yLmFwcGx5KHRoaXNBcmcsIF9hcmd1bWVudHMgfHwgW10pKS5uZXh0KCkpOw0KICAgICAgICB9KTsNCiAgICB9CgogICAgLyoKICAgICAqIGJhc2U2NC1hcnJheWJ1ZmZlciAxLjAuMSA8aHR0cHM6Ly9naXRodWIuY29tL25pa2xhc3ZoL2Jhc2U2NC1hcnJheWJ1ZmZlcj4KICAgICAqIENvcHlyaWdodCAoYykgMjAyMSBOaWtsYXMgdm9uIEhlcnR6ZW4gPGh0dHBzOi8vaGVydHplbi5jb20+CiAgICAgKiBSZWxlYXNlZCB1bmRlciBNSVQgTGljZW5zZQogICAgICovCiAgICB2YXIgY2hhcnMgPSAnQUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVphYmNkZWZnaGlqa2xtbm9wcXJzdHV2d3h5ejAxMjM0NTY3ODkrLyc7CiAgICAvLyBVc2UgYSBsb29rdXAgdGFibGUgdG8gZmluZCB0aGUgaW5kZXguCiAgICB2YXIgbG9va3VwID0gdHlwZW9mIFVpbnQ4QXJyYXkgPT09ICd1bmRlZmluZWQnID8gW10gOiBuZXcgVWludDhBcnJheSgyNTYpOwogICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjaGFycy5sZW5ndGg7IGkrKykgewogICAgICAgIGxvb2t1cFtjaGFycy5jaGFyQ29kZUF0KGkpXSA9IGk7CiAgICB9CiAgICB2YXIgZW5jb2RlID0gZnVuY3Rpb24gKGFycmF5YnVmZmVyKSB7CiAgICAgICAgdmFyIGJ5dGVzID0gbmV3IFVpbnQ4QXJyYXkoYXJyYXlidWZmZXIpLCBpLCBsZW4gPSBieXRlcy5sZW5ndGgsIGJhc2U2NCA9ICcnOwogICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW47IGkgKz0gMykgewogICAgICAgICAgICBiYXNlNjQgKz0gY2hhcnNbYnl0ZXNbaV0gPj4gMl07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1soKGJ5dGVzW2ldICYgMykgPDwgNCkgfCAoYnl0ZXNbaSArIDFdID4+IDQpXTsKICAgICAgICAgICAgYmFzZTY0ICs9IGNoYXJzWygoYnl0ZXNbaSArIDFdICYgMTUpIDw8IDIpIHwgKGJ5dGVzW2kgKyAyXSA+PiA2KV07CiAgICAgICAgICAgIGJhc2U2NCArPSBjaGFyc1tieXRlc1tpICsgMl0gJiA2M107CiAgICAgICAgfQogICAgICAgIGlmIChsZW4gJSAzID09PSAyKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDEpICsgJz0nOwogICAgICAgIH0KICAgICAgICBlbHNlIGlmIChsZW4gJSAzID09PSAxKSB7CiAgICAgICAgICAgIGJhc2U2NCA9IGJhc2U2NC5zdWJzdHJpbmcoMCwgYmFzZTY0Lmxlbmd0aCAtIDIpICsgJz09JzsKICAgICAgICB9CiAgICAgICAgcmV0dXJuIGJhc2U2NDsKICAgIH07CgogICAgY29uc3QgbGFzdEJsb2JNYXAgPSBuZXcgTWFwKCk7DQogICAgY29uc3QgdHJhbnNwYXJlbnRCbG9iTWFwID0gbmV3IE1hcCgpOw0KICAgIGZ1bmN0aW9uIGdldFRyYW5zcGFyZW50QmxvYkZvcih3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucykgew0KICAgICAgICByZXR1cm4gX19hd2FpdGVyKHRoaXMsIHZvaWQgMCwgdm9pZCAwLCBmdW5jdGlvbiogKCkgew0KICAgICAgICAgICAgY29uc3QgaWQgPSBgJHt3aWR0aH0tJHtoZWlnaHR9YDsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgaWYgKHRyYW5zcGFyZW50QmxvYk1hcC5oYXMoaWQpKQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJhbnNwYXJlbnRCbG9iTWFwLmdldChpZCk7DQogICAgICAgICAgICAgICAgY29uc3Qgb2Zmc2NyZWVuID0gbmV3IE9mZnNjcmVlbkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTsNCiAgICAgICAgICAgICAgICBvZmZzY3JlZW4uZ2V0Q29udGV4dCgnMmQnKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0geWllbGQgYmxvYi5hcnJheUJ1ZmZlcigpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGJhc2U2NCA9IGVuY29kZShhcnJheUJ1ZmZlcik7DQogICAgICAgICAgICAgICAgdHJhbnNwYXJlbnRCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICByZXR1cm4gYmFzZTY0Ow0KICAgICAgICAgICAgfQ0KICAgICAgICAgICAgZWxzZSB7DQogICAgICAgICAgICAgICAgcmV0dXJuICcnOw0KICAgICAgICAgICAgfQ0KICAgICAgICB9KTsNCiAgICB9DQogICAgY29uc3Qgd29ya2VyID0gc2VsZjsNCiAgICB3b3JrZXIub25tZXNzYWdlID0gZnVuY3Rpb24gKGUpIHsNCiAgICAgICAgcmV0dXJuIF9fYXdhaXRlcih0aGlzLCB2b2lkIDAsIHZvaWQgMCwgZnVuY3Rpb24qICgpIHsNCiAgICAgICAgICAgIGlmICgnT2Zmc2NyZWVuQ2FudmFzJyBpbiBnbG9iYWxUaGlzKSB7DQogICAgICAgICAgICAgICAgY29uc3QgeyBpZCwgYml0bWFwLCB3aWR0aCwgaGVpZ2h0LCBkYXRhVVJMT3B0aW9ucyB9ID0gZS5kYXRhOw0KICAgICAgICAgICAgICAgIGNvbnN0IHRyYW5zcGFyZW50QmFzZTY0ID0gZ2V0VHJhbnNwYXJlbnRCbG9iRm9yKHdpZHRoLCBoZWlnaHQsIGRhdGFVUkxPcHRpb25zKTsNCiAgICAgICAgICAgICAgICBjb25zdCBvZmZzY3JlZW4gPSBuZXcgT2Zmc2NyZWVuQ2FudmFzKHdpZHRoLCBoZWlnaHQpOw0KICAgICAgICAgICAgICAgIGNvbnN0IGN0eCA9IG9mZnNjcmVlbi5nZXRDb250ZXh0KCcyZCcpOw0KICAgICAgICAgICAgICAgIGN0eC5kcmF3SW1hZ2UoYml0bWFwLCAwLCAwKTsNCiAgICAgICAgICAgICAgICBiaXRtYXAuY2xvc2UoKTsNCiAgICAgICAgICAgICAgICBjb25zdCBibG9iID0geWllbGQgb2Zmc2NyZWVuLmNvbnZlcnRUb0Jsb2IoZGF0YVVSTE9wdGlvbnMpOw0KICAgICAgICAgICAgICAgIGNvbnN0IHR5cGUgPSBibG9iLnR5cGU7DQogICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSB5aWVsZCBibG9iLmFycmF5QnVmZmVyKCk7DQogICAgICAgICAgICAgICAgY29uc3QgYmFzZTY0ID0gZW5jb2RlKGFycmF5QnVmZmVyKTsNCiAgICAgICAgICAgICAgICBpZiAoIWxhc3RCbG9iTWFwLmhhcyhpZCkgJiYgKHlpZWxkIHRyYW5zcGFyZW50QmFzZTY0KSA9PT0gYmFzZTY0KSB7DQogICAgICAgICAgICAgICAgICAgIGxhc3RCbG9iTWFwLnNldChpZCwgYmFzZTY0KTsNCiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHdvcmtlci5wb3N0TWVzc2FnZSh7IGlkIH0pOw0KICAgICAgICAgICAgICAgIH0NCiAgICAgICAgICAgICAgICBpZiAobGFzdEJsb2JNYXAuZ2V0KGlkKSA9PT0gYmFzZTY0KQ0KICAgICAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQgfSk7DQogICAgICAgICAgICAgICAgd29ya2VyLnBvc3RNZXNzYWdlKHsNCiAgICAgICAgICAgICAgICAgICAgaWQsDQogICAgICAgICAgICAgICAgICAgIHR5cGUsDQogICAgICAgICAgICAgICAgICAgIGJhc2U2NCwNCiAgICAgICAgICAgICAgICAgICAgd2lkdGgsDQogICAgICAgICAgICAgICAgICAgIGhlaWdodCwNCiAgICAgICAgICAgICAgICB9KTsNCiAgICAgICAgICAgICAgICBsYXN0QmxvYk1hcC5zZXQoaWQsIGJhc2U2NCk7DQogICAgICAgICAgICB9DQogICAgICAgICAgICBlbHNlIHsNCiAgICAgICAgICAgICAgICByZXR1cm4gd29ya2VyLnBvc3RNZXNzYWdlKHsgaWQ6IGUuZGF0YS5pZCB9KTsNCiAgICAgICAgICAgIH0NCiAgICAgICAgfSk7DQogICAgfTsKCn0pKCk7Cgo=",
    null,
    false
  );

  class CanvasManager {
    reset() {
      this.pendingCanvasMutations.clear();
      this.resetObservers && this.resetObservers();
    }
    freeze() {
      this.frozen = true;
    }
    unfreeze() {
      this.frozen = false;
    }
    lock() {
      this.locked = true;
    }
    unlock() {
      this.locked = false;
    }
    constructor(options) {
      this.pendingCanvasMutations = new Map();
      this.rafStamps = { latestId: 0, invokeId: null };
      this.frozen = false;
      this.locked = false;
      this.processMutation = (target, mutation) => {
        const newFrame = this.rafStamps.invokeId && this.rafStamps.latestId !== this.rafStamps.invokeId;
        if (newFrame || !this.rafStamps.invokeId) this.rafStamps.invokeId = this.rafStamps.latestId;
        if (!this.pendingCanvasMutations.has(target)) {
          this.pendingCanvasMutations.set(target, []);
        }
        this.pendingCanvasMutations.get(target).push(mutation);
      };
      const { sampling = "all", win, blockClass, blockSelector, recordCanvas, dataURLOptions } = options;
      this.mutationCb = options.mutationCb;
      this.mirror = options.mirror;
      if (recordCanvas && sampling === "all") this.initCanvasMutationObserver(win, blockClass, blockSelector);
      if (recordCanvas && typeof sampling === "number")
        this.initCanvasFPSObserver(sampling, win, blockClass, blockSelector, {
          dataURLOptions,
        });
    }
    initCanvasFPSObserver(fps, win, blockClass, blockSelector, options) {
      const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, true);
      const snapshotInProgressMap = new Map();
      const worker = new WorkerFactory();
      worker.onmessage = (e) => {
        const { id } = e.data;
        snapshotInProgressMap.set(id, false);
        if (!("base64" in e.data)) return;
        const { base64, type, width, height } = e.data;
        this.mutationCb({
          id,
          type: CanvasContext["2D"],
          commands: [
            {
              property: "clearRect",
              args: [0, 0, width, height],
            },
            {
              property: "drawImage",
              args: [
                {
                  rr_type: "ImageBitmap",
                  args: [
                    {
                      rr_type: "Blob",
                      data: [{ rr_type: "ArrayBuffer", base64 }],
                      type,
                    },
                  ],
                },
                0,
                0,
              ],
            },
          ],
        });
      };
      const timeBetweenSnapshots = 1000 / fps;
      let lastSnapshotTime = 0;
      let rafId;
      const getCanvas = () => {
        const matchedCanvas = [];
        win.document.querySelectorAll("canvas").forEach((canvas) => {
          if (!isBlocked(canvas, blockClass, blockSelector, true)) {
            matchedCanvas.push(canvas);
          }
        });
        return matchedCanvas;
      };
      const takeCanvasSnapshots = (timestamp) => {
        if (lastSnapshotTime && timestamp - lastSnapshotTime < timeBetweenSnapshots) {
          rafId = requestAnimationFrame(takeCanvasSnapshots);
          return;
        }
        lastSnapshotTime = timestamp;
        getCanvas().forEach((canvas) =>
          __awaiter(this, void 0, void 0, function* () {
            var _a;
            const id = this.mirror.getId(canvas);
            if (snapshotInProgressMap.get(id)) return;
            snapshotInProgressMap.set(id, true);
            if (["webgl", "webgl2"].includes(canvas.__context)) {
              const context = canvas.getContext(canvas.__context);
              if (
                ((_a = context === null || context === void 0 ? void 0 : context.getContextAttributes()) === null ||
                _a === void 0
                  ? void 0
                  : _a.preserveDrawingBuffer) === false
              ) {
                context.clear(context.COLOR_BUFFER_BIT);
              }
            }
            const bitmap = yield createImageBitmap(canvas);
            worker.postMessage(
              {
                id,
                bitmap,
                width: canvas.width,
                height: canvas.height,
                dataURLOptions: options.dataURLOptions,
              },
              [bitmap]
            );
          })
        );
        rafId = requestAnimationFrame(takeCanvasSnapshots);
      };
      rafId = requestAnimationFrame(takeCanvasSnapshots);
      this.resetObservers = () => {
        canvasContextReset();
        cancelAnimationFrame(rafId);
      };
    }
    initCanvasMutationObserver(win, blockClass, blockSelector) {
      this.startRAFTimestamping();
      this.startPendingCanvasMutationFlusher();
      const canvasContextReset = initCanvasContextObserver(win, blockClass, blockSelector, false);
      const canvas2DReset = initCanvas2DMutationObserver(
        this.processMutation.bind(this),
        win,
        blockClass,
        blockSelector
      );
      const canvasWebGL1and2Reset = initCanvasWebGLMutationObserver(
        this.processMutation.bind(this),
        win,
        blockClass,
        blockSelector,
        this.mirror
      );
      this.resetObservers = () => {
        canvasContextReset();
        canvas2DReset();
        canvasWebGL1and2Reset();
      };
    }
    startPendingCanvasMutationFlusher() {
      requestAnimationFrame(() => this.flushPendingCanvasMutations());
    }
    startRAFTimestamping() {
      const setLatestRAFTimestamp = (timestamp) => {
        this.rafStamps.latestId = timestamp;
        requestAnimationFrame(setLatestRAFTimestamp);
      };
      requestAnimationFrame(setLatestRAFTimestamp);
    }
    flushPendingCanvasMutations() {
      this.pendingCanvasMutations.forEach((values, canvas) => {
        const id = this.mirror.getId(canvas);
        this.flushPendingCanvasMutationFor(canvas, id);
      });
      requestAnimationFrame(() => this.flushPendingCanvasMutations());
    }
    flushPendingCanvasMutationFor(canvas, id) {
      if (this.frozen || this.locked) {
        return;
      }
      const valuesWithType = this.pendingCanvasMutations.get(canvas);
      if (!valuesWithType || id === -1) return;
      const values = valuesWithType.map((value) => {
        const rest = __rest(value, ["type"]);
        return rest;
      });
      const { type } = valuesWithType[0];
      this.mutationCb({ id, type, commands: values });
      this.pendingCanvasMutations.delete(canvas);
    }
  }

  class StylesheetManager {
    constructor(options) {
      this.trackedLinkElements = new WeakSet();
      this.styleMirror = new StyleSheetMirror();
      this.mutationCb = options.mutationCb;
      this.adoptedStyleSheetCb = options.adoptedStyleSheetCb;
    }
    attachLinkElement(linkEl, childSn) {
      if ("_cssText" in childSn.attributes)
        this.mutationCb({
          adds: [],
          removes: [],
          texts: [],
          attributes: [
            {
              id: childSn.id,
              attributes: childSn.attributes,
            },
          ],
        });
      this.trackLinkElement(linkEl);
    }
    trackLinkElement(linkEl) {
      if (this.trackedLinkElements.has(linkEl)) return;
      this.trackedLinkElements.add(linkEl);
      this.trackStylesheetInLinkElement(linkEl);
    }
    adoptStyleSheets(sheets, hostId) {
      if (sheets.length === 0) return;
      const adoptedStyleSheetData = {
        id: hostId,
        styleIds: [],
      };
      const styles = [];
      for (const sheet of sheets) {
        let styleId;
        if (!this.styleMirror.has(sheet)) {
          styleId = this.styleMirror.add(sheet);
          const rules = Array.from(sheet.rules || CSSRule);
          styles.push({
            styleId,
            rules: rules.map((r, index) => {
              return {
                rule: stringifyRule(r),
                index,
              };
            }),
          });
        } else styleId = this.styleMirror.getId(sheet);
        adoptedStyleSheetData.styleIds.push(styleId);
      }
      if (styles.length > 0) adoptedStyleSheetData.styles = styles;
      this.adoptedStyleSheetCb(adoptedStyleSheetData);
    }
    reset() {
      this.styleMirror.reset();
      this.trackedLinkElements = new WeakSet();
    }
    trackStylesheetInLinkElement(linkEl) {}
  }

  class ProcessedNodeManager {
    constructor() {
      this.nodeMap = new WeakMap();
      this.loop = true;
      this.periodicallyClear();
    }
    periodicallyClear() {
      requestAnimationFrame(() => {
        this.clear();
        if (this.loop) this.periodicallyClear();
      });
    }
    inOtherBuffer(node, thisBuffer) {
      const buffers = this.nodeMap.get(node);
      return buffers && Array.from(buffers).some((buffer) => buffer !== thisBuffer);
    }
    add(node, buffer) {
      this.nodeMap.set(node, (this.nodeMap.get(node) || new Set()).add(buffer));
    }
    clear() {
      this.nodeMap = new WeakMap();
    }
    destroy() {
      this.loop = false;
    }
  }

  function wrapEvent(e) {
    return Object.assign(Object.assign({}, e), { timestamp: nowTimestamp() });
  }
  let wrappedEmit;
  let takeFullSnapshot;
  let canvasManager;
  let recording = false;
  const mirror = createMirror();
  function record(options = {}) {
    const {
      emit,
      checkoutEveryNms,
      checkoutEveryNth,
      blockClass = "rr-block",
      blockSelector = null,
      ignoreClass = "rr-ignore",
      ignoreSelector = null,
      maskTextClass = "rr-mask",
      maskTextSelector = null,
      inlineStylesheet = true,
      maskAllInputs,
      maskInputOptions: _maskInputOptions,
      slimDOMOptions: _slimDOMOptions,
      maskInputFn,
      maskTextFn,
      hooks,
      packFn,
      sampling = {},
      dataURLOptions = {},
      mousemoveWait,
      recordCanvas = false,
      recordCrossOriginIframes = false,
      recordAfter = options.recordAfter === "DOMContentLoaded" ? options.recordAfter : "load",
      userTriggeredOnInput = false,
      collectFonts = false,
      inlineImages = false,
      plugins,
      keepIframeSrcFn = () => false,
      ignoreCSSAttributes = new Set([]),
      errorHandler,
    } = options;
    registerErrorHandler(errorHandler);
    const inEmittingFrame = recordCrossOriginIframes ? window.parent === window : true;
    let passEmitsToParent = false;
    if (!inEmittingFrame) {
      try {
        if (window.parent.document) {
          passEmitsToParent = false;
        }
      } catch (e) {
        passEmitsToParent = true;
      }
    }
    if (inEmittingFrame && !emit) {
      throw new Error("emit function is required");
    }
    if (mousemoveWait !== undefined && sampling.mousemove === undefined) {
      sampling.mousemove = mousemoveWait;
    }
    mirror.reset();
    const maskInputOptions =
      maskAllInputs === true
        ? {
            color: true,
            date: true,
            "datetime-local": true,
            email: true,
            month: true,
            number: true,
            range: true,
            search: true,
            tel: true,
            text: true,
            time: true,
            url: true,
            week: true,
            textarea: true,
            select: true,
            password: true,
          }
        : _maskInputOptions !== undefined
        ? _maskInputOptions
        : { password: true };
    const slimDOMOptions =
      _slimDOMOptions === true || _slimDOMOptions === "all"
        ? {
            script: true,
            comment: true,
            headFavicon: true,
            headWhitespace: true,
            headMetaSocial: true,
            headMetaRobots: true,
            headMetaHttpEquiv: true,
            headMetaVerification: true,
            headMetaAuthorship: _slimDOMOptions === "all",
            headMetaDescKeywords: _slimDOMOptions === "all",
          }
        : _slimDOMOptions
        ? _slimDOMOptions
        : {};
    polyfill();
    let lastFullSnapshotEvent;
    let incrementalSnapshotCount = 0;
    const eventProcessor = (e) => {
      for (const plugin of plugins || []) {
        if (plugin.eventProcessor) {
          e = plugin.eventProcessor(e);
        }
      }
      if (packFn && !passEmitsToParent) {
        e = packFn(e);
      }
      return e;
    };
    wrappedEmit = (e, isCheckout) => {
      var _a;
      if (
        ((_a = mutationBuffers[0]) === null || _a === void 0 ? void 0 : _a.isFrozen()) &&
        e.type !== EventType.FullSnapshot &&
        !(e.type === EventType.IncrementalSnapshot && e.data.source === IncrementalSource.Mutation)
      ) {
        mutationBuffers.forEach((buf) => buf.unfreeze());
      }
      if (inEmittingFrame) {
        emit === null || emit === void 0 ? void 0 : emit(eventProcessor(e), isCheckout);
      } else if (passEmitsToParent) {
        const message = {
          type: "rrweb",
          event: eventProcessor(e),
          origin: window.location.origin,
          isCheckout,
        };
        window.parent.postMessage(message, "*");
      }
      if (e.type === EventType.FullSnapshot) {
        lastFullSnapshotEvent = e;
        incrementalSnapshotCount = 0;
      } else if (e.type === EventType.IncrementalSnapshot) {
        if (e.data.source === IncrementalSource.Mutation && e.data.isAttachIframe) {
          return;
        }
        incrementalSnapshotCount++;
        const exceedCount = checkoutEveryNth && incrementalSnapshotCount >= checkoutEveryNth;
        const exceedTime = checkoutEveryNms && e.timestamp - lastFullSnapshotEvent.timestamp > checkoutEveryNms;
        if (exceedCount || exceedTime) {
          takeFullSnapshot(true);
        }
      }
    };
    const wrappedMutationEmit = (m) => {
      wrappedEmit(
        wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Mutation }, m),
        })
      );
    };
    const wrappedScrollEmit = (p) =>
      wrappedEmit(
        wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.Scroll }, p),
        })
      );
    const wrappedCanvasMutationEmit = (p) =>
      wrappedEmit(
        wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.CanvasMutation }, p),
        })
      );
    const wrappedAdoptedStyleSheetEmit = (a) =>
      wrappedEmit(
        wrapEvent({
          type: EventType.IncrementalSnapshot,
          data: Object.assign({ source: IncrementalSource.AdoptedStyleSheet }, a),
        })
      );
    const stylesheetManager = new StylesheetManager({
      mutationCb: wrappedMutationEmit,
      adoptedStyleSheetCb: wrappedAdoptedStyleSheetEmit,
    });
    const iframeManager = new IframeManager({
      mirror,
      mutationCb: wrappedMutationEmit,
      stylesheetManager: stylesheetManager,
      recordCrossOriginIframes,
      wrappedEmit,
    });
    for (const plugin of plugins || []) {
      if (plugin.getMirror)
        plugin.getMirror({
          nodeMirror: mirror,
          crossOriginIframeMirror: iframeManager.crossOriginIframeMirror,
          crossOriginIframeStyleMirror: iframeManager.crossOriginIframeStyleMirror,
        });
    }
    const processedNodeManager = new ProcessedNodeManager();
    canvasManager = new CanvasManager({
      recordCanvas,
      mutationCb: wrappedCanvasMutationEmit,
      win: window,
      blockClass,
      blockSelector,
      mirror,
      sampling: sampling.canvas,
      dataURLOptions,
    });
    const shadowDomManager = new ShadowDomManager({
      mutationCb: wrappedMutationEmit,
      scrollCb: wrappedScrollEmit,
      bypassOptions: {
        blockClass,
        blockSelector,
        maskTextClass,
        maskTextSelector,
        inlineStylesheet,
        maskInputOptions,
        dataURLOptions,
        maskTextFn,
        maskInputFn,
        recordCanvas,
        inlineImages,
        sampling,
        slimDOMOptions,
        iframeManager,
        stylesheetManager,
        canvasManager,
        keepIframeSrcFn,
        processedNodeManager,
      },
      mirror,
    });
    takeFullSnapshot = (isCheckout = false) => {
      wrappedEmit(
        wrapEvent({
          type: EventType.Meta,
          data: {
            href: window.location.href,
            width: getWindowWidth(),
            height: getWindowHeight(),
          },
        }),
        isCheckout
      );
      stylesheetManager.reset();
      shadowDomManager.init();
      mutationBuffers.forEach((buf) => buf.lock());
      const node = snapshot(document, {
        mirror,
        blockClass,
        blockSelector,
        maskTextClass,
        maskTextSelector,
        inlineStylesheet,
        maskAllInputs: maskInputOptions,
        maskTextFn,
        slimDOM: slimDOMOptions,
        dataURLOptions,
        recordCanvas,
        inlineImages,
        onSerialize: (n) => {
          if (isSerializedIframe(n, mirror)) {
            iframeManager.addIframe(n);
          }
          if (isSerializedStylesheet(n, mirror)) {
            stylesheetManager.trackLinkElement(n);
          }
          if (hasShadowRoot(n)) {
            shadowDomManager.addShadowRoot(n.shadowRoot, document);
          }
        },
        onIframeLoad: (iframe, childSn) => {
          iframeManager.attachIframe(iframe, childSn);
          shadowDomManager.observeAttachShadow(iframe);
        },
        onStylesheetLoad: (linkEl, childSn) => {
          stylesheetManager.attachLinkElement(linkEl, childSn);
        },
        keepIframeSrcFn,
      });
      if (!node) {
        return console.warn("Failed to snapshot the document");
      }
      wrappedEmit(
        wrapEvent({
          type: EventType.FullSnapshot,
          data: {
            node,
            initialOffset: getWindowScroll(window),
          },
        }),
        isCheckout
      );
      mutationBuffers.forEach((buf) => buf.unlock());
      if (document.adoptedStyleSheets && document.adoptedStyleSheets.length > 0)
        stylesheetManager.adoptStyleSheets(document.adoptedStyleSheets, mirror.getId(document));
    };
    try {
      const handlers = [];
      const observe = (doc) => {
        var _a;
        return callbackWrapper(initObservers)(
          {
            mutationCb: wrappedMutationEmit,
            mousemoveCb: (positions, source) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: {
                    source,
                    positions,
                  },
                })
              ),
            mouseInteractionCb: (d) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.MouseInteraction }, d),
                })
              ),
            scrollCb: wrappedScrollEmit,
            viewportResizeCb: (d) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.ViewportResize }, d),
                })
              ),
            inputCb: (v) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.Input }, v),
                })
              ),
            mediaInteractionCb: (p) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.MediaInteraction }, p),
                })
              ),
            styleSheetRuleCb: (r) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.StyleSheetRule }, r),
                })
              ),
            styleDeclarationCb: (r) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.StyleDeclaration }, r),
                })
              ),
            canvasMutationCb: wrappedCanvasMutationEmit,
            fontCb: (p) =>
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.Font }, p),
                })
              ),
            selectionCb: (p) => {
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.Selection }, p),
                })
              );
            },
            customElementCb: (c) => {
              wrappedEmit(
                wrapEvent({
                  type: EventType.IncrementalSnapshot,
                  data: Object.assign({ source: IncrementalSource.CustomElement }, c),
                })
              );
            },
            blockClass,
            ignoreClass,
            ignoreSelector,
            maskTextClass,
            maskTextSelector,
            maskInputOptions,
            inlineStylesheet,
            sampling,
            recordCanvas,
            inlineImages,
            userTriggeredOnInput,
            collectFonts,
            doc,
            maskInputFn,
            maskTextFn,
            keepIframeSrcFn,
            blockSelector,
            slimDOMOptions,
            dataURLOptions,
            mirror,
            iframeManager,
            stylesheetManager,
            shadowDomManager,
            processedNodeManager,
            canvasManager,
            ignoreCSSAttributes,
            plugins:
              ((_a = plugins === null || plugins === void 0 ? void 0 : plugins.filter((p) => p.observer)) === null ||
              _a === void 0
                ? void 0
                : _a.map((p) => ({
                    observer: p.observer,
                    options: p.options,
                    callback: (payload) =>
                      wrappedEmit(
                        wrapEvent({
                          type: EventType.Plugin,
                          data: {
                            plugin: p.name,
                            payload,
                          },
                        })
                      ),
                  }))) || [],
          },
          hooks
        );
      };
      iframeManager.addLoadListener((iframeEl) => {
        try {
          handlers.push(observe(iframeEl.contentDocument));
        } catch (error) {
          console.warn(error);
        }
      });
      const init = () => {
        takeFullSnapshot();
        handlers.push(observe(document));
        recording = true;
      };
      if (document.readyState === "interactive" || document.readyState === "complete") {
        init();
      } else {
        handlers.push(
          on("DOMContentLoaded", () => {
            wrappedEmit(
              wrapEvent({
                type: EventType.DomContentLoaded,
                data: {},
              })
            );
            if (recordAfter === "DOMContentLoaded") init();
          })
        );
        handlers.push(
          on(
            "load",
            () => {
              wrappedEmit(
                wrapEvent({
                  type: EventType.Load,
                  data: {},
                })
              );
              if (recordAfter === "load") init();
            },
            window
          )
        );
      }
      return () => {
        handlers.forEach((h) => h());
        processedNodeManager.destroy();
        recording = false;
        unregisterErrorHandler();
      };
    } catch (error) {
      console.warn(error);
    }
  }
  record.addCustomEvent = (tag, payload) => {
    if (!recording) {
      throw new Error("please add custom event after start recording");
    }
    wrappedEmit(
      wrapEvent({
        type: EventType.Custom,
        data: {
          tag,
          payload,
        },
      })
    );
  };
  record.freezePage = () => {
    mutationBuffers.forEach((buf) => buf.freeze());
  };
  record.takeFullSnapshot = (isCheckout) => {
    if (!recording) {
      throw new Error("please take full snapshot after start recording");
    }
    takeFullSnapshot(isCheckout);
  };
  record.mirror = mirror;

  class StackFrame {
    constructor(obj) {
      this.fileName = obj.fileName || "";
      this.functionName = obj.functionName || "";
      this.lineNumber = obj.lineNumber;
      this.columnNumber = obj.columnNumber;
    }
    toString() {
      const lineNumber = this.lineNumber || "";
      const columnNumber = this.columnNumber || "";
      if (this.functionName) return `${this.functionName} (${this.fileName}:${lineNumber}:${columnNumber})`;
      return `${this.fileName}:${lineNumber}:${columnNumber}`;
    }
  }
  const FIREFOX_SAFARI_STACK_REGEXP = /(^|@)\S+:\d+/;
  const CHROME_IE_STACK_REGEXP = /^\s*at .*(\S+:\d+|\(native\))/m;
  const SAFARI_NATIVE_CODE_REGEXP = /^(eval@)?(\[native code])?$/;
  const ErrorStackParser = {
    parse: function (error) {
      if (!error) {
        return [];
      }
      if (typeof error.stacktrace !== "undefined" || typeof error["opera#sourceloc"] !== "undefined") {
        return this.parseOpera(error);
      } else if (error.stack && error.stack.match(CHROME_IE_STACK_REGEXP)) {
        return this.parseV8OrIE(error);
      } else if (error.stack) {
        return this.parseFFOrSafari(error);
      } else {
        console.warn("[console-record-plugin]: Failed to parse error object:", error);
        return [];
      }
    },
    extractLocation: function (urlLike) {
      if (urlLike.indexOf(":") === -1) {
        return [urlLike];
      }
      const regExp = /(.+?)(?::(\d+))?(?::(\d+))?$/;
      const parts = regExp.exec(urlLike.replace(/[()]/g, ""));
      if (!parts) throw new Error(`Cannot parse given url: ${urlLike}`);
      return [parts[1], parts[2] || undefined, parts[3] || undefined];
    },
    parseV8OrIE: function (error) {
      const filtered = error.stack.split("\n").filter(function (line) {
        return !!line.match(CHROME_IE_STACK_REGEXP);
      }, this);
      return filtered.map(function (line) {
        if (line.indexOf("(eval ") > -1) {
          line = line.replace(/eval code/g, "eval").replace(/(\(eval at [^()]*)|(\),.*$)/g, "");
        }
        let sanitizedLine = line.replace(/^\s+/, "").replace(/\(eval code/g, "(");
        const location = sanitizedLine.match(/ (\((.+):(\d+):(\d+)\)$)/);
        sanitizedLine = location ? sanitizedLine.replace(location[0], "") : sanitizedLine;
        const tokens = sanitizedLine.split(/\s+/).slice(1);
        const locationParts = this.extractLocation(location ? location[1] : tokens.pop());
        const functionName = tokens.join(" ") || undefined;
        const fileName = ["eval", "<anonymous>"].indexOf(locationParts[0]) > -1 ? undefined : locationParts[0];
        return new StackFrame({
          functionName,
          fileName,
          lineNumber: locationParts[1],
          columnNumber: locationParts[2],
        });
      }, this);
    },
    parseFFOrSafari: function (error) {
      const filtered = error.stack.split("\n").filter(function (line) {
        return !line.match(SAFARI_NATIVE_CODE_REGEXP);
      }, this);
      return filtered.map(function (line) {
        if (line.indexOf(" > eval") > -1) {
          line = line.replace(/ line (\d+)(?: > eval line \d+)* > eval:\d+:\d+/g, ":$1");
        }
        if (line.indexOf("@") === -1 && line.indexOf(":") === -1) {
          return new StackFrame({
            functionName: line,
          });
        } else {
          const functionNameRegex = /((.*".+"[^@]*)?[^@]*)(?:@)/;
          const matches = line.match(functionNameRegex);
          const functionName = matches && matches[1] ? matches[1] : undefined;
          const locationParts = this.extractLocation(line.replace(functionNameRegex, ""));
          return new StackFrame({
            functionName,
            fileName: locationParts[0],
            lineNumber: locationParts[1],
            columnNumber: locationParts[2],
          });
        }
      }, this);
    },
    parseOpera: function (e) {
      if (
        !e.stacktrace ||
        (e.message.indexOf("\n") > -1 && e.message.split("\n").length > e.stacktrace.split("\n").length)
      ) {
        return this.parseOpera9(e);
      } else if (!e.stack) {
        return this.parseOpera10(e);
      } else {
        return this.parseOpera11(e);
      }
    },
    parseOpera9: function (e) {
      const lineRE = /Line (\d+).*script (?:in )?(\S+)/i;
      const lines = e.message.split("\n");
      const result = [];
      for (let i = 2, len = lines.length; i < len; i += 2) {
        const match = lineRE.exec(lines[i]);
        if (match) {
          result.push(
            new StackFrame({
              fileName: match[2],
              lineNumber: parseFloat(match[1]),
            })
          );
        }
      }
      return result;
    },
    parseOpera10: function (e) {
      const lineRE = /Line (\d+).*script (?:in )?(\S+)(?:: In function (\S+))?$/i;
      const lines = e.stacktrace.split("\n");
      const result = [];
      for (let i = 0, len = lines.length; i < len; i += 2) {
        const match = lineRE.exec(lines[i]);
        if (match) {
          result.push(
            new StackFrame({
              functionName: match[3] || undefined,
              fileName: match[2],
              lineNumber: parseFloat(match[1]),
            })
          );
        }
      }
      return result;
    },
    parseOpera11: function (error) {
      const filtered = error.stack.split("\n").filter(function (line) {
        return !!line.match(FIREFOX_SAFARI_STACK_REGEXP) && !line.match(/^Error created at/);
      }, this);
      return filtered.map(function (line) {
        const tokens = line.split("@");
        const locationParts = this.extractLocation(tokens.pop());
        const functionCall = tokens.shift() || "";
        const functionName =
          functionCall.replace(/<anonymous function(: (\w+))?>/, "$2").replace(/\([^)]*\)/g, "") || undefined;
        return new StackFrame({
          functionName,
          fileName: locationParts[0],
          lineNumber: locationParts[1],
          columnNumber: locationParts[2],
        });
      }, this);
    },
  };

  function pathToSelector(node) {
    if (!node || !node.outerHTML) {
      return "";
    }
    let path = "";
    while (node.parentElement) {
      let name = node.localName;
      if (!name) {
        break;
      }
      name = name.toLowerCase();
      const parent = node.parentElement;
      const domSiblings = [];
      if (parent.children && parent.children.length > 0) {
        for (let i = 0; i < parent.children.length; i++) {
          const sibling = parent.children[i];
          if (sibling.localName && sibling.localName.toLowerCase) {
            if (sibling.localName.toLowerCase() === name) {
              domSiblings.push(sibling);
            }
          }
        }
      }
      if (domSiblings.length > 1) {
        name += `:eq(${domSiblings.indexOf(node)})`;
      }
      path = name + (path ? ">" + path : "");
      node = parent;
    }
    return path;
  }
  function isObject(obj) {
    return Object.prototype.toString.call(obj) === "[object Object]";
  }
  function isObjTooDeep(obj, limit) {
    if (limit === 0) {
      return true;
    }
    const keys = Object.keys(obj);
    for (const key of keys) {
      if (isObject(obj[key]) && isObjTooDeep(obj[key], limit - 1)) {
        return true;
      }
    }
    return false;
  }
  function stringify(obj, stringifyOptions) {
    const options = {
      numOfKeysLimit: 50,
      depthOfLimit: 4,
    };
    Object.assign(options, stringifyOptions);
    const stack = [];
    const keys = [];
    return JSON.stringify(obj, function (key, value) {
      if (stack.length > 0) {
        const thisPos = stack.indexOf(this);
        ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
        ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
        if (~stack.indexOf(value)) {
          if (stack[0] === value) {
            value = "[Circular ~]";
          } else {
            value = "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
          }
        }
      } else {
        stack.push(value);
      }
      if (value === null) return value;
      if (value === undefined) return "undefined";
      if (shouldIgnore(value)) {
        return toString(value);
      }
      if (value instanceof Event) {
        const eventResult = {};
        for (const eventKey in value) {
          const eventValue = value[eventKey];
          if (Array.isArray(eventValue)) {
            eventResult[eventKey] = pathToSelector(eventValue.length ? eventValue[0] : null);
          } else {
            eventResult[eventKey] = eventValue;
          }
        }
        return eventResult;
      } else if (value instanceof Node) {
        if (value instanceof HTMLElement) {
          return value ? value.outerHTML : "";
        }
        return value.nodeName;
      } else if (value instanceof Error) {
        return value.stack ? value.stack + "\nEnd of stack for Error object" : value.name + ": " + value.message;
      }
      return value;
    });
    function shouldIgnore(_obj) {
      if (isObject(_obj) && Object.keys(_obj).length > options.numOfKeysLimit) {
        return true;
      }
      if (typeof _obj === "function") {
        return true;
      }
      if (isObject(_obj) && isObjTooDeep(_obj, options.depthOfLimit)) {
        return true;
      }
      return false;
    }
    function toString(_obj) {
      let str = _obj.toString();
      if (options.stringLengthLimit && str.length > options.stringLengthLimit) {
        str = `${str.slice(0, options.stringLengthLimit)}...`;
      }
      return str;
    }
  }

  const defaultLogOptions = {
    level: [
      "assert",
      "clear",
      "count",
      "countReset",
      "debug",
      "dir",
      "dirxml",
      "error",
      "group",
      "groupCollapsed",
      "groupEnd",
      "info",
      "log",
      "table",
      "time",
      "timeEnd",
      "timeLog",
      "trace",
      "warn",
    ],
    lengthThreshold: 1000,
    logger: "console",
  };
  function initLogObserver(cb, win, options) {
    const logOptions = options ? Object.assign({}, defaultLogOptions, options) : defaultLogOptions;
    const loggerType = logOptions.logger;
    if (!loggerType) {
      return () => {};
    }
    let logger;
    if (typeof loggerType === "string") {
      logger = win[loggerType];
    } else {
      logger = loggerType;
    }
    let logCount = 0;
    let inStack = false;
    const cancelHandlers = [];
    if (logOptions.level.includes("error")) {
      const errorHandler = (event) => {
        const message = event.message,
          error = event.error;
        const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
        const payload = [stringify(message, logOptions.stringifyOptions)];
        cb({
          level: "error",
          trace,
          payload,
        });
      };
      win.addEventListener("error", errorHandler);
      cancelHandlers.push(() => {
        win.removeEventListener("error", errorHandler);
      });
      const unhandledrejectionHandler = (event) => {
        let error;
        let payload;
        if (event.reason instanceof Error) {
          error = event.reason;
          payload = [stringify(`Uncaught (in promise) ${error.name}: ${error.message}`, logOptions.stringifyOptions)];
        } else {
          error = new Error();
          payload = [
            stringify("Uncaught (in promise)", logOptions.stringifyOptions),
            stringify(event.reason, logOptions.stringifyOptions),
          ];
        }
        const trace = ErrorStackParser.parse(error).map((stackFrame) => stackFrame.toString());
        cb({
          level: "error",
          trace,
          payload,
        });
      };
      win.addEventListener("unhandledrejection", unhandledrejectionHandler);
      cancelHandlers.push(() => {
        win.removeEventListener("unhandledrejection", unhandledrejectionHandler);
      });
    }
    for (const levelType of logOptions.level) {
      cancelHandlers.push(replace(logger, levelType));
    }
    return () => {
      cancelHandlers.forEach((h) => h());
    };
    function replace(_logger, level) {
      if (!_logger[level]) {
        return () => {};
      }
      return patch(_logger, level, (original) => {
        return (...args) => {
          original.apply(this, args);
          if (inStack) {
            return;
          }
          inStack = true;
          try {
            const trace = ErrorStackParser.parse(new Error())
              .map((stackFrame) => stackFrame.toString())
              .splice(1);
            const payload = args.map((s) => stringify(s, logOptions.stringifyOptions));
            logCount++;
            if (logCount < logOptions.lengthThreshold) {
              cb({
                level,
                trace,
                payload,
              });
            } else if (logCount === logOptions.lengthThreshold) {
              cb({
                level: "warn",
                trace: [],
                payload: [stringify("The number of log records reached the threshold.")],
              });
            }
          } catch (error) {
            original("rrweb logger error:", error, ...args);
          } finally {
            inStack = false;
          }
        };
      });
    }
  }
  const PLUGIN_NAME = "rrweb/console@1";
  const getRecordConsolePlugin = (options) => ({
    name: PLUGIN_NAME,
    observer: initLogObserver,
    options: options,
  });

  exports.RQSessionEventType = void 0;
  (function (RQSessionEventType) {
    RQSessionEventType["RRWEB"] = "rrweb";
    RQSessionEventType["NETWORK"] = "network";
  })(exports.RQSessionEventType || (exports.RQSessionEventType = {}));
  exports.RQNetworkEventErrorCodes = void 0;
  (function (RQNetworkEventErrorCodes) {
    RQNetworkEventErrorCodes[(RQNetworkEventErrorCodes["REQUEST_TOO_LARGE"] = 101)] = "REQUEST_TOO_LARGE";
    RQNetworkEventErrorCodes[(RQNetworkEventErrorCodes["RESPONSE_TOO_LARGE"] = 102)] = "RESPONSE_TOO_LARGE";
  })(exports.RQNetworkEventErrorCodes || (exports.RQNetworkEventErrorCodes = {}));

  // NOTE: this list must be up-to-date with browsers listed in
  // test/acceptance/useragentstrings.yml
  const BROWSER_ALIASES_MAP = {
    "Amazon Silk": "amazon_silk",
    "Android Browser": "android",
    Bada: "bada",
    BlackBerry: "blackberry",
    Chrome: "chrome",
    Chromium: "chromium",
    Electron: "electron",
    Epiphany: "epiphany",
    Firefox: "firefox",
    Focus: "focus",
    Generic: "generic",
    "Google Search": "google_search",
    Googlebot: "googlebot",
    "Internet Explorer": "ie",
    "K-Meleon": "k_meleon",
    Maxthon: "maxthon",
    "Microsoft Edge": "edge",
    "MZ Browser": "mz",
    "NAVER Whale Browser": "naver",
    Opera: "opera",
    "Opera Coast": "opera_coast",
    PhantomJS: "phantomjs",
    Puffin: "puffin",
    QupZilla: "qupzilla",
    QQ: "qq",
    QQLite: "qqlite",
    Safari: "safari",
    Sailfish: "sailfish",
    "Samsung Internet for Android": "samsung_internet",
    SeaMonkey: "seamonkey",
    Sleipnir: "sleipnir",
    Swing: "swing",
    Tizen: "tizen",
    "UC Browser": "uc",
    Vivaldi: "vivaldi",
    "WebOS Browser": "webos",
    WeChat: "wechat",
    "Yandex Browser": "yandex",
    Roku: "roku",
  };

  const BROWSER_MAP = {
    amazon_silk: "Amazon Silk",
    android: "Android Browser",
    bada: "Bada",
    blackberry: "BlackBerry",
    chrome: "Chrome",
    chromium: "Chromium",
    electron: "Electron",
    epiphany: "Epiphany",
    firefox: "Firefox",
    focus: "Focus",
    generic: "Generic",
    googlebot: "Googlebot",
    google_search: "Google Search",
    ie: "Internet Explorer",
    k_meleon: "K-Meleon",
    maxthon: "Maxthon",
    edge: "Microsoft Edge",
    mz: "MZ Browser",
    naver: "NAVER Whale Browser",
    opera: "Opera",
    opera_coast: "Opera Coast",
    phantomjs: "PhantomJS",
    puffin: "Puffin",
    qupzilla: "QupZilla",
    qq: "QQ Browser",
    qqlite: "QQ Browser Lite",
    safari: "Safari",
    sailfish: "Sailfish",
    samsung_internet: "Samsung Internet for Android",
    seamonkey: "SeaMonkey",
    sleipnir: "Sleipnir",
    swing: "Swing",
    tizen: "Tizen",
    uc: "UC Browser",
    vivaldi: "Vivaldi",
    webos: "WebOS Browser",
    wechat: "WeChat",
    yandex: "Yandex Browser",
  };

  const PLATFORMS_MAP = {
    tablet: "tablet",
    mobile: "mobile",
    desktop: "desktop",
    tv: "tv",
  };

  const OS_MAP = {
    WindowsPhone: "Windows Phone",
    Windows: "Windows",
    MacOS: "macOS",
    iOS: "iOS",
    Android: "Android",
    WebOS: "WebOS",
    BlackBerry: "BlackBerry",
    Bada: "Bada",
    Tizen: "Tizen",
    Linux: "Linux",
    ChromeOS: "Chrome OS",
    PlayStation4: "PlayStation 4",
    Roku: "Roku",
  };

  const ENGINE_MAP = {
    EdgeHTML: "EdgeHTML",
    Blink: "Blink",
    Trident: "Trident",
    Presto: "Presto",
    Gecko: "Gecko",
    WebKit: "WebKit",
  };

  class Utils {
    /**
     * Get first matched item for a string
     * @param {RegExp} regexp
     * @param {String} ua
     * @return {Array|{index: number, input: string}|*|boolean|string}
     */
    static getFirstMatch(regexp, ua) {
      const match = ua.match(regexp);
      return (match && match.length > 0 && match[1]) || "";
    }

    /**
     * Get second matched item for a string
     * @param regexp
     * @param {String} ua
     * @return {Array|{index: number, input: string}|*|boolean|string}
     */
    static getSecondMatch(regexp, ua) {
      const match = ua.match(regexp);
      return (match && match.length > 1 && match[2]) || "";
    }

    /**
     * Match a regexp and return a constant or undefined
     * @param {RegExp} regexp
     * @param {String} ua
     * @param {*} _const Any const that will be returned if regexp matches the string
     * @return {*}
     */
    static matchAndReturnConst(regexp, ua, _const) {
      if (regexp.test(ua)) {
        return _const;
      }
      return void 0;
    }

    static getWindowsVersionName(version) {
      switch (version) {
        case "NT":
          return "NT";
        case "XP":
          return "XP";
        case "NT 5.0":
          return "2000";
        case "NT 5.1":
          return "XP";
        case "NT 5.2":
          return "2003";
        case "NT 6.0":
          return "Vista";
        case "NT 6.1":
          return "7";
        case "NT 6.2":
          return "8";
        case "NT 6.3":
          return "8.1";
        case "NT 10.0":
          return "10";
        default:
          return undefined;
      }
    }

    /**
     * Get macOS version name
     *    10.5 - Leopard
     *    10.6 - Snow Leopard
     *    10.7 - Lion
     *    10.8 - Mountain Lion
     *    10.9 - Mavericks
     *    10.10 - Yosemite
     *    10.11 - El Capitan
     *    10.12 - Sierra
     *    10.13 - High Sierra
     *    10.14 - Mojave
     *    10.15 - Catalina
     *
     * @example
     *   getMacOSVersionName("10.14") // 'Mojave'
     *
     * @param  {string} version
     * @return {string} versionName
     */
    static getMacOSVersionName(version) {
      const v = version
        .split(".")
        .splice(0, 2)
        .map((s) => parseInt(s, 10) || 0);
      v.push(0);
      if (v[0] !== 10) return undefined;
      switch (v[1]) {
        case 5:
          return "Leopard";
        case 6:
          return "Snow Leopard";
        case 7:
          return "Lion";
        case 8:
          return "Mountain Lion";
        case 9:
          return "Mavericks";
        case 10:
          return "Yosemite";
        case 11:
          return "El Capitan";
        case 12:
          return "Sierra";
        case 13:
          return "High Sierra";
        case 14:
          return "Mojave";
        case 15:
          return "Catalina";
        default:
          return undefined;
      }
    }

    /**
     * Get Android version name
     *    1.5 - Cupcake
     *    1.6 - Donut
     *    2.0 - Eclair
     *    2.1 - Eclair
     *    2.2 - Froyo
     *    2.x - Gingerbread
     *    3.x - Honeycomb
     *    4.0 - Ice Cream Sandwich
     *    4.1 - Jelly Bean
     *    4.4 - KitKat
     *    5.x - Lollipop
     *    6.x - Marshmallow
     *    7.x - Nougat
     *    8.x - Oreo
     *    9.x - Pie
     *
     * @example
     *   getAndroidVersionName("7.0") // 'Nougat'
     *
     * @param  {string} version
     * @return {string} versionName
     */
    static getAndroidVersionName(version) {
      const v = version
        .split(".")
        .splice(0, 2)
        .map((s) => parseInt(s, 10) || 0);
      v.push(0);
      if (v[0] === 1 && v[1] < 5) return undefined;
      if (v[0] === 1 && v[1] < 6) return "Cupcake";
      if (v[0] === 1 && v[1] >= 6) return "Donut";
      if (v[0] === 2 && v[1] < 2) return "Eclair";
      if (v[0] === 2 && v[1] === 2) return "Froyo";
      if (v[0] === 2 && v[1] > 2) return "Gingerbread";
      if (v[0] === 3) return "Honeycomb";
      if (v[0] === 4 && v[1] < 1) return "Ice Cream Sandwich";
      if (v[0] === 4 && v[1] < 4) return "Jelly Bean";
      if (v[0] === 4 && v[1] >= 4) return "KitKat";
      if (v[0] === 5) return "Lollipop";
      if (v[0] === 6) return "Marshmallow";
      if (v[0] === 7) return "Nougat";
      if (v[0] === 8) return "Oreo";
      if (v[0] === 9) return "Pie";
      return undefined;
    }

    /**
     * Get version precisions count
     *
     * @example
     *   getVersionPrecision("1.10.3") // 3
     *
     * @param  {string} version
     * @return {number}
     */
    static getVersionPrecision(version) {
      return version.split(".").length;
    }

    /**
     * Calculate browser version weight
     *
     * @example
     *   compareVersions('1.10.2.1',  '1.8.2.1.90')    // 1
     *   compareVersions('1.010.2.1', '1.09.2.1.90');  // 1
     *   compareVersions('1.10.2.1',  '1.10.2.1');     // 0
     *   compareVersions('1.10.2.1',  '1.0800.2');     // -1
     *   compareVersions('1.10.2.1',  '1.10',  true);  // 0
     *
     * @param {String} versionA versions versions to compare
     * @param {String} versionB versions versions to compare
     * @param {boolean} [isLoose] enable loose comparison
     * @return {Number} comparison result: -1 when versionA is lower,
     * 1 when versionA is bigger, 0 when both equal
     */
    /* eslint consistent-return: 1 */
    static compareVersions(versionA, versionB, isLoose = false) {
      // 1) get common precision for both versions, for example for "10.0" and "9" it should be 2
      const versionAPrecision = Utils.getVersionPrecision(versionA);
      const versionBPrecision = Utils.getVersionPrecision(versionB);

      let precision = Math.max(versionAPrecision, versionBPrecision);
      let lastPrecision = 0;

      const chunks = Utils.map([versionA, versionB], (version) => {
        const delta = precision - Utils.getVersionPrecision(version);

        // 2) "9" -> "9.0" (for precision = 2)
        const _version = version + new Array(delta + 1).join(".0");

        // 3) "9.0" -> ["000000000"", "000000009"]
        return Utils.map(_version.split("."), (chunk) => new Array(20 - chunk.length).join("0") + chunk).reverse();
      });

      // adjust precision for loose comparison
      if (isLoose) {
        lastPrecision = precision - Math.min(versionAPrecision, versionBPrecision);
      }

      // iterate in reverse order by reversed chunks array
      precision -= 1;
      while (precision >= lastPrecision) {
        // 4) compare: "000000009" > "000000010" = false (but "9" > "10" = true)
        if (chunks[0][precision] > chunks[1][precision]) {
          return 1;
        }

        if (chunks[0][precision] === chunks[1][precision]) {
          if (precision === lastPrecision) {
            // all version chunks are same
            return 0;
          }

          precision -= 1;
        } else if (chunks[0][precision] < chunks[1][precision]) {
          return -1;
        }
      }

      return undefined;
    }

    /**
     * Array::map polyfill
     *
     * @param  {Array} arr
     * @param  {Function} iterator
     * @return {Array}
     */
    static map(arr, iterator) {
      const result = [];
      let i;
      if (Array.prototype.map) {
        return Array.prototype.map.call(arr, iterator);
      }
      for (i = 0; i < arr.length; i += 1) {
        result.push(iterator(arr[i]));
      }
      return result;
    }

    /**
     * Array::find polyfill
     *
     * @param  {Array} arr
     * @param  {Function} predicate
     * @return {Array}
     */
    static find(arr, predicate) {
      let i;
      let l;
      if (Array.prototype.find) {
        return Array.prototype.find.call(arr, predicate);
      }
      for (i = 0, l = arr.length; i < l; i += 1) {
        const value = arr[i];
        if (predicate(value, i)) {
          return value;
        }
      }
      return undefined;
    }

    /**
     * Object::assign polyfill
     *
     * @param  {Object} obj
     * @param  {Object} ...objs
     * @return {Object}
     */
    static assign(obj, ...assigners) {
      const result = obj;
      let i;
      let l;
      if (Object.assign) {
        return Object.assign(obj, ...assigners);
      }
      for (i = 0, l = assigners.length; i < l; i += 1) {
        const assigner = assigners[i];
        if (typeof assigner === "object" && assigner !== null) {
          const keys = Object.keys(assigner);
          keys.forEach((key) => {
            result[key] = assigner[key];
          });
        }
      }
      return obj;
    }

    /**
     * Get short version/alias for a browser name
     *
     * @example
     *   getBrowserAlias('Microsoft Edge') // edge
     *
     * @param  {string} browserName
     * @return {string}
     */
    static getBrowserAlias(browserName) {
      return BROWSER_ALIASES_MAP[browserName];
    }

    /**
     * Get short version/alias for a browser name
     *
     * @example
     *   getBrowserAlias('edge') // Microsoft Edge
     *
     * @param  {string} browserAlias
     * @return {string}
     */
    static getBrowserTypeByAlias(browserAlias) {
      return BROWSER_MAP[browserAlias] || "";
    }
  }

  /**
   * Browsers' descriptors
   *
   * The idea of descriptors is simple. You should know about them two simple things:
   * 1. Every descriptor has a method or property called `test` and a `describe` method.
   * 2. Order of descriptors is important.
   *
   * More details:
   * 1. Method or property `test` serves as a way to detect whether the UA string
   * matches some certain browser or not. The `describe` method helps to make a result
   * object with params that show some browser-specific things: name, version, etc.
   * 2. Order of descriptors is important because a Parser goes through them one by one
   * in course. For example, if you insert Chrome's descriptor as the first one,
   * more then a half of browsers will be described as Chrome, because they will pass
   * the Chrome descriptor's test.
   *
   * Descriptor's `test` could be a property with an array of RegExps, where every RegExp
   * will be applied to a UA string to test it whether it matches or not.
   * If a descriptor has two or more regexps in the `test` array it tests them one by one
   * with a logical sum operation. Parser stops if it has found any RegExp that matches the UA.
   *
   * Or `test` could be a method. In that case it gets a Parser instance and should
   * return true/false to get the Parser know if this browser descriptor matches the UA or not.
   */

  const commonVersionIdentifier = /version\/(\d+(\.?_?\d+)+)/i;

  const browsersList = [
    /* Googlebot */
    {
      test: [/googlebot/i],
      describe(ua) {
        const browser = {
          name: "Googlebot",
        };
        const version =
          Utils.getFirstMatch(/googlebot\/(\d+(\.\d+))/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },

    /* Opera < 13.0 */
    {
      test: [/opera/i],
      describe(ua) {
        const browser = {
          name: "Opera",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:opera)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },

    /* Opera > 13.0 */
    {
      test: [/opr\/|opios/i],
      describe(ua) {
        const browser = {
          name: "Opera",
        };
        const version =
          Utils.getFirstMatch(/(?:opr|opios)[\s/](\S+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/SamsungBrowser/i],
      describe(ua) {
        const browser = {
          name: "Samsung Internet for Android",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:SamsungBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/Whale/i],
      describe(ua) {
        const browser = {
          name: "NAVER Whale Browser",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) || Utils.getFirstMatch(/(?:whale)[\s/](\d+(?:\.\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/MZBrowser/i],
      describe(ua) {
        const browser = {
          name: "MZ Browser",
        };
        const version =
          Utils.getFirstMatch(/(?:MZBrowser)[\s/](\d+(?:\.\d+)+)/i, ua) ||
          Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/focus/i],
      describe(ua) {
        const browser = {
          name: "Focus",
        };
        const version =
          Utils.getFirstMatch(/(?:focus)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/swing/i],
      describe(ua) {
        const browser = {
          name: "Swing",
        };
        const version =
          Utils.getFirstMatch(/(?:swing)[\s/](\d+(?:\.\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/coast/i],
      describe(ua) {
        const browser = {
          name: "Opera Coast",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:coast)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/opt\/\d+(?:.?_?\d+)+/i],
      describe(ua) {
        const browser = {
          name: "Opera Touch",
        };
        const version =
          Utils.getFirstMatch(/(?:opt)[\s/](\d+(\.?_?\d+)+)/i, ua) || Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/yabrowser/i],
      describe(ua) {
        const browser = {
          name: "Yandex Browser",
        };
        const version =
          Utils.getFirstMatch(/(?:yabrowser)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
          Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/ucbrowser/i],
      describe(ua) {
        const browser = {
          name: "UC Browser",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:ucbrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/Maxthon|mxios/i],
      describe(ua) {
        const browser = {
          name: "Maxthon",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:Maxthon|mxios)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/epiphany/i],
      describe(ua) {
        const browser = {
          name: "Epiphany",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:epiphany)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/puffin/i],
      describe(ua) {
        const browser = {
          name: "Puffin",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:puffin)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/sleipnir/i],
      describe(ua) {
        const browser = {
          name: "Sleipnir",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:sleipnir)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/k-meleon/i],
      describe(ua) {
        const browser = {
          name: "K-Meleon",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/(?:k-meleon)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/micromessenger/i],
      describe(ua) {
        const browser = {
          name: "WeChat",
        };
        const version =
          Utils.getFirstMatch(/(?:micromessenger)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
          Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/qqbrowser/i],
      describe(ua) {
        const browser = {
          name: /qqbrowserlite/i.test(ua) ? "QQ Browser Lite" : "QQ Browser",
        };
        const version =
          Utils.getFirstMatch(/(?:qqbrowserlite|qqbrowser)[/](\d+(\.?_?\d+)+)/i, ua) ||
          Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/msie|trident/i],
      describe(ua) {
        const browser = {
          name: "Internet Explorer",
        };
        const version = Utils.getFirstMatch(/(?:msie |rv:)(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/\sedg\//i],
      describe(ua) {
        const browser = {
          name: "Microsoft Edge",
        };

        const version = Utils.getFirstMatch(/\sedg\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/edg([ea]|ios)/i],
      describe(ua) {
        const browser = {
          name: "Microsoft Edge",
        };

        const version = Utils.getSecondMatch(/edg([ea]|ios)\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/vivaldi/i],
      describe(ua) {
        const browser = {
          name: "Vivaldi",
        };
        const version = Utils.getFirstMatch(/vivaldi\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/seamonkey/i],
      describe(ua) {
        const browser = {
          name: "SeaMonkey",
        };
        const version = Utils.getFirstMatch(/seamonkey\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/sailfish/i],
      describe(ua) {
        const browser = {
          name: "Sailfish",
        };

        const version = Utils.getFirstMatch(/sailfish\s?browser\/(\d+(\.\d+)?)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/silk/i],
      describe(ua) {
        const browser = {
          name: "Amazon Silk",
        };
        const version = Utils.getFirstMatch(/silk\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/phantom/i],
      describe(ua) {
        const browser = {
          name: "PhantomJS",
        };
        const version = Utils.getFirstMatch(/phantomjs\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/slimerjs/i],
      describe(ua) {
        const browser = {
          name: "SlimerJS",
        };
        const version = Utils.getFirstMatch(/slimerjs\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
      describe(ua) {
        const browser = {
          name: "BlackBerry",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/blackberry[\d]+\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/(web|hpw)[o0]s/i],
      describe(ua) {
        const browser = {
          name: "WebOS Browser",
        };
        const version =
          Utils.getFirstMatch(commonVersionIdentifier, ua) ||
          Utils.getFirstMatch(/w(?:eb)?[o0]sbrowser\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/bada/i],
      describe(ua) {
        const browser = {
          name: "Bada",
        };
        const version = Utils.getFirstMatch(/dolfin\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/tizen/i],
      describe(ua) {
        const browser = {
          name: "Tizen",
        };
        const version =
          Utils.getFirstMatch(/(?:tizen\s?)?browser\/(\d+(\.?_?\d+)+)/i, ua) ||
          Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/qupzilla/i],
      describe(ua) {
        const browser = {
          name: "QupZilla",
        };
        const version =
          Utils.getFirstMatch(/(?:qupzilla)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
          Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/firefox|iceweasel|fxios/i],
      describe(ua) {
        const browser = {
          name: "Firefox",
        };
        const version = Utils.getFirstMatch(/(?:firefox|iceweasel|fxios)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/electron/i],
      describe(ua) {
        const browser = {
          name: "Electron",
        };
        const version = Utils.getFirstMatch(/(?:electron)\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/MiuiBrowser/i],
      describe(ua) {
        const browser = {
          name: "Miui",
        };
        const version = Utils.getFirstMatch(/(?:MiuiBrowser)[\s/](\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/chromium/i],
      describe(ua) {
        const browser = {
          name: "Chromium",
        };
        const version =
          Utils.getFirstMatch(/(?:chromium)[\s/](\d+(\.?_?\d+)+)/i, ua) ||
          Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/chrome|crios|crmo/i],
      describe(ua) {
        const browser = {
          name: "Chrome",
        };
        const version = Utils.getFirstMatch(/(?:chrome|crios|crmo)\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },
    {
      test: [/GSA/i],
      describe(ua) {
        const browser = {
          name: "Google Search",
        };
        const version = Utils.getFirstMatch(/(?:GSA)\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },

    /* Android Browser */
    {
      test(parser) {
        const notLikeAndroid = !parser.test(/like android/i);
        const butAndroid = parser.test(/android/i);
        return notLikeAndroid && butAndroid;
      },
      describe(ua) {
        const browser = {
          name: "Android Browser",
        };
        const version = Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },

    /* PlayStation 4 */
    {
      test: [/playstation 4/i],
      describe(ua) {
        const browser = {
          name: "PlayStation 4",
        };
        const version = Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },

    /* Safari */
    {
      test: [/safari|applewebkit/i],
      describe(ua) {
        const browser = {
          name: "Safari",
        };
        const version = Utils.getFirstMatch(commonVersionIdentifier, ua);

        if (version) {
          browser.version = version;
        }

        return browser;
      },
    },

    /* Something else */
    {
      test: [/.*/i],
      describe(ua) {
        /* Here we try to make sure that there are explicit details about the device
         * in order to decide what regexp exactly we want to apply
         * (as there is a specific decision based on that conclusion)
         */
        const regexpWithoutDeviceSpec = /^(.*)\/(.*) /;
        const regexpWithDeviceSpec = /^(.*)\/(.*)[ \t]\((.*)/;
        const hasDeviceSpec = ua.search("\\(") !== -1;
        const regexp = hasDeviceSpec ? regexpWithDeviceSpec : regexpWithoutDeviceSpec;
        return {
          name: Utils.getFirstMatch(regexp, ua),
          version: Utils.getSecondMatch(regexp, ua),
        };
      },
    },
  ];

  var osParsersList = [
    /* Roku */
    {
      test: [/Roku\/DVP/],
      describe(ua) {
        const version = Utils.getFirstMatch(/Roku\/DVP-(\d+\.\d+)/i, ua);
        return {
          name: OS_MAP.Roku,
          version,
        };
      },
    },

    /* Windows Phone */
    {
      test: [/windows phone/i],
      describe(ua) {
        const version = Utils.getFirstMatch(/windows phone (?:os)?\s?(\d+(\.\d+)*)/i, ua);
        return {
          name: OS_MAP.WindowsPhone,
          version,
        };
      },
    },

    /* Windows */
    {
      test: [/windows /i],
      describe(ua) {
        const version = Utils.getFirstMatch(/Windows ((NT|XP)( \d\d?.\d)?)/i, ua);
        const versionName = Utils.getWindowsVersionName(version);

        return {
          name: OS_MAP.Windows,
          version,
          versionName,
        };
      },
    },

    /* Firefox on iPad */
    {
      test: [/Macintosh(.*?) FxiOS(.*?)\//],
      describe(ua) {
        const result = {
          name: OS_MAP.iOS,
        };
        const version = Utils.getSecondMatch(/(Version\/)(\d[\d.]+)/, ua);
        if (version) {
          result.version = version;
        }
        return result;
      },
    },

    /* macOS */
    {
      test: [/macintosh/i],
      describe(ua) {
        const version = Utils.getFirstMatch(/mac os x (\d+(\.?_?\d+)+)/i, ua).replace(/[_\s]/g, ".");
        const versionName = Utils.getMacOSVersionName(version);

        const os = {
          name: OS_MAP.MacOS,
          version,
        };
        if (versionName) {
          os.versionName = versionName;
        }
        return os;
      },
    },

    /* iOS */
    {
      test: [/(ipod|iphone|ipad)/i],
      describe(ua) {
        const version = Utils.getFirstMatch(/os (\d+([_\s]\d+)*) like mac os x/i, ua).replace(/[_\s]/g, ".");

        return {
          name: OS_MAP.iOS,
          version,
        };
      },
    },

    /* Android */
    {
      test(parser) {
        const notLikeAndroid = !parser.test(/like android/i);
        const butAndroid = parser.test(/android/i);
        return notLikeAndroid && butAndroid;
      },
      describe(ua) {
        const version = Utils.getFirstMatch(/android[\s/-](\d+(\.\d+)*)/i, ua);
        const versionName = Utils.getAndroidVersionName(version);
        const os = {
          name: OS_MAP.Android,
          version,
        };
        if (versionName) {
          os.versionName = versionName;
        }
        return os;
      },
    },

    /* WebOS */
    {
      test: [/(web|hpw)[o0]s/i],
      describe(ua) {
        const version = Utils.getFirstMatch(/(?:web|hpw)[o0]s\/(\d+(\.\d+)*)/i, ua);
        const os = {
          name: OS_MAP.WebOS,
        };

        if (version && version.length) {
          os.version = version;
        }
        return os;
      },
    },

    /* BlackBerry */
    {
      test: [/blackberry|\bbb\d+/i, /rim\stablet/i],
      describe(ua) {
        const version =
          Utils.getFirstMatch(/rim\stablet\sos\s(\d+(\.\d+)*)/i, ua) ||
          Utils.getFirstMatch(/blackberry\d+\/(\d+([_\s]\d+)*)/i, ua) ||
          Utils.getFirstMatch(/\bbb(\d+)/i, ua);

        return {
          name: OS_MAP.BlackBerry,
          version,
        };
      },
    },

    /* Bada */
    {
      test: [/bada/i],
      describe(ua) {
        const version = Utils.getFirstMatch(/bada\/(\d+(\.\d+)*)/i, ua);

        return {
          name: OS_MAP.Bada,
          version,
        };
      },
    },

    /* Tizen */
    {
      test: [/tizen/i],
      describe(ua) {
        const version = Utils.getFirstMatch(/tizen[/\s](\d+(\.\d+)*)/i, ua);

        return {
          name: OS_MAP.Tizen,
          version,
        };
      },
    },

    /* Linux */
    {
      test: [/linux/i],
      describe() {
        return {
          name: OS_MAP.Linux,
        };
      },
    },

    /* Chrome OS */
    {
      test: [/CrOS/],
      describe() {
        return {
          name: OS_MAP.ChromeOS,
        };
      },
    },

    /* Playstation 4 */
    {
      test: [/PlayStation 4/],
      describe(ua) {
        const version = Utils.getFirstMatch(/PlayStation 4[/\s](\d+(\.\d+)*)/i, ua);
        return {
          name: OS_MAP.PlayStation4,
          version,
        };
      },
    },
  ];

  /*
   * Tablets go first since usually they have more specific
   * signs to detect.
   */

  var platformParsersList = [
    /* Googlebot */
    {
      test: [/googlebot/i],
      describe() {
        return {
          type: "bot",
          vendor: "Google",
        };
      },
    },

    /* Huawei */
    {
      test: [/huawei/i],
      describe(ua) {
        const model = Utils.getFirstMatch(/(can-l01)/i, ua) && "Nova";
        const platform = {
          type: PLATFORMS_MAP.mobile,
          vendor: "Huawei",
        };
        if (model) {
          platform.model = model;
        }
        return platform;
      },
    },

    /* Nexus Tablet */
    {
      test: [/nexus\s*(?:7|8|9|10).*/i],
      describe() {
        return {
          type: PLATFORMS_MAP.tablet,
          vendor: "Nexus",
        };
      },
    },

    /* iPad */
    {
      test: [/ipad/i],
      describe() {
        return {
          type: PLATFORMS_MAP.tablet,
          vendor: "Apple",
          model: "iPad",
        };
      },
    },

    /* Firefox on iPad */
    {
      test: [/Macintosh(.*?) FxiOS(.*?)\//],
      describe() {
        return {
          type: PLATFORMS_MAP.tablet,
          vendor: "Apple",
          model: "iPad",
        };
      },
    },

    /* Amazon Kindle Fire */
    {
      test: [/kftt build/i],
      describe() {
        return {
          type: PLATFORMS_MAP.tablet,
          vendor: "Amazon",
          model: "Kindle Fire HD 7",
        };
      },
    },

    /* Another Amazon Tablet with Silk */
    {
      test: [/silk/i],
      describe() {
        return {
          type: PLATFORMS_MAP.tablet,
          vendor: "Amazon",
        };
      },
    },

    /* Tablet */
    {
      test: [/tablet(?! pc)/i],
      describe() {
        return {
          type: PLATFORMS_MAP.tablet,
        };
      },
    },

    /* iPod/iPhone */
    {
      test(parser) {
        const iDevice = parser.test(/ipod|iphone/i);
        const likeIDevice = parser.test(/like (ipod|iphone)/i);
        return iDevice && !likeIDevice;
      },
      describe(ua) {
        const model = Utils.getFirstMatch(/(ipod|iphone)/i, ua);
        return {
          type: PLATFORMS_MAP.mobile,
          vendor: "Apple",
          model,
        };
      },
    },

    /* Nexus Mobile */
    {
      test: [/nexus\s*[0-6].*/i, /galaxy nexus/i],
      describe() {
        return {
          type: PLATFORMS_MAP.mobile,
          vendor: "Nexus",
        };
      },
    },

    /* Mobile */
    {
      test: [/[^-]mobi/i],
      describe() {
        return {
          type: PLATFORMS_MAP.mobile,
        };
      },
    },

    /* BlackBerry */
    {
      test(parser) {
        return parser.getBrowserName(true) === "blackberry";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.mobile,
          vendor: "BlackBerry",
        };
      },
    },

    /* Bada */
    {
      test(parser) {
        return parser.getBrowserName(true) === "bada";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.mobile,
        };
      },
    },

    /* Windows Phone */
    {
      test(parser) {
        return parser.getBrowserName() === "windows phone";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.mobile,
          vendor: "Microsoft",
        };
      },
    },

    /* Android Tablet */
    {
      test(parser) {
        const osMajorVersion = Number(String(parser.getOSVersion()).split(".")[0]);
        return parser.getOSName(true) === "android" && osMajorVersion >= 3;
      },
      describe() {
        return {
          type: PLATFORMS_MAP.tablet,
        };
      },
    },

    /* Android Mobile */
    {
      test(parser) {
        return parser.getOSName(true) === "android";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.mobile,
        };
      },
    },

    /* desktop */
    {
      test(parser) {
        return parser.getOSName(true) === "macos";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.desktop,
          vendor: "Apple",
        };
      },
    },

    /* Windows */
    {
      test(parser) {
        return parser.getOSName(true) === "windows";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.desktop,
        };
      },
    },

    /* Linux */
    {
      test(parser) {
        return parser.getOSName(true) === "linux";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.desktop,
        };
      },
    },

    /* PlayStation 4 */
    {
      test(parser) {
        return parser.getOSName(true) === "playstation 4";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.tv,
        };
      },
    },

    /* Roku */
    {
      test(parser) {
        return parser.getOSName(true) === "roku";
      },
      describe() {
        return {
          type: PLATFORMS_MAP.tv,
        };
      },
    },
  ];

  /*
   * More specific goes first
   */
  var enginesParsersList = [
    /* EdgeHTML */
    {
      test(parser) {
        return parser.getBrowserName(true) === "microsoft edge";
      },
      describe(ua) {
        const isBlinkBased = /\sedg\//i.test(ua);

        // return blink if it's blink-based one
        if (isBlinkBased) {
          return {
            name: ENGINE_MAP.Blink,
          };
        }

        // otherwise match the version and return EdgeHTML
        const version = Utils.getFirstMatch(/edge\/(\d+(\.?_?\d+)+)/i, ua);

        return {
          name: ENGINE_MAP.EdgeHTML,
          version,
        };
      },
    },

    /* Trident */
    {
      test: [/trident/i],
      describe(ua) {
        const engine = {
          name: ENGINE_MAP.Trident,
        };

        const version = Utils.getFirstMatch(/trident\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          engine.version = version;
        }

        return engine;
      },
    },

    /* Presto */
    {
      test(parser) {
        return parser.test(/presto/i);
      },
      describe(ua) {
        const engine = {
          name: ENGINE_MAP.Presto,
        };

        const version = Utils.getFirstMatch(/presto\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          engine.version = version;
        }

        return engine;
      },
    },

    /* Gecko */
    {
      test(parser) {
        const isGecko = parser.test(/gecko/i);
        const likeGecko = parser.test(/like gecko/i);
        return isGecko && !likeGecko;
      },
      describe(ua) {
        const engine = {
          name: ENGINE_MAP.Gecko,
        };

        const version = Utils.getFirstMatch(/gecko\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          engine.version = version;
        }

        return engine;
      },
    },

    /* Blink */
    {
      test: [/(apple)?webkit\/537\.36/i],
      describe() {
        return {
          name: ENGINE_MAP.Blink,
        };
      },
    },

    /* WebKit */
    {
      test: [/(apple)?webkit/i],
      describe(ua) {
        const engine = {
          name: ENGINE_MAP.WebKit,
        };

        const version = Utils.getFirstMatch(/webkit\/(\d+(\.?_?\d+)+)/i, ua);

        if (version) {
          engine.version = version;
        }

        return engine;
      },
    },
  ];

  /**
   * The main class that arranges the whole parsing process.
   */
  class Parser {
    /**
     * Create instance of Parser
     *
     * @param {String} UA User-Agent string
     * @param {Boolean} [skipParsing=false] parser can skip parsing in purpose of performance
     * improvements if you need to make a more particular parsing
     * like {@link Parser#parseBrowser} or {@link Parser#parsePlatform}
     *
     * @throw {Error} in case of empty UA String
     *
     * @constructor
     */
    constructor(UA, skipParsing = false) {
      if (UA === void 0 || UA === null || UA === "") {
        throw new Error("UserAgent parameter can't be empty");
      }

      this._ua = UA;

      /**
       * @typedef ParsedResult
       * @property {Object} browser
       * @property {String|undefined} [browser.name]
       * Browser name, like `"Chrome"` or `"Internet Explorer"`
       * @property {String|undefined} [browser.version] Browser version as a String `"12.01.45334.10"`
       * @property {Object} os
       * @property {String|undefined} [os.name] OS name, like `"Windows"` or `"macOS"`
       * @property {String|undefined} [os.version] OS version, like `"NT 5.1"` or `"10.11.1"`
       * @property {String|undefined} [os.versionName] OS name, like `"XP"` or `"High Sierra"`
       * @property {Object} platform
       * @property {String|undefined} [platform.type]
       * platform type, can be either `"desktop"`, `"tablet"` or `"mobile"`
       * @property {String|undefined} [platform.vendor] Vendor of the device,
       * like `"Apple"` or `"Samsung"`
       * @property {String|undefined} [platform.model] Device model,
       * like `"iPhone"` or `"Kindle Fire HD 7"`
       * @property {Object} engine
       * @property {String|undefined} [engine.name]
       * Can be any of this: `WebKit`, `Blink`, `Gecko`, `Trident`, `Presto`, `EdgeHTML`
       * @property {String|undefined} [engine.version] String version of the engine
       */
      this.parsedResult = {};

      if (skipParsing !== true) {
        this.parse();
      }
    }

    /**
     * Get UserAgent string of current Parser instance
     * @return {String} User-Agent String of the current <Parser> object
     *
     * @public
     */
    getUA() {
      return this._ua;
    }

    /**
     * Test a UA string for a regexp
     * @param {RegExp} regex
     * @return {Boolean}
     */
    test(regex) {
      return regex.test(this._ua);
    }

    /**
     * Get parsed browser object
     * @return {Object}
     */
    parseBrowser() {
      this.parsedResult.browser = {};

      const browserDescriptor = Utils.find(browsersList, (_browser) => {
        if (typeof _browser.test === "function") {
          return _browser.test(this);
        }

        if (_browser.test instanceof Array) {
          return _browser.test.some((condition) => this.test(condition));
        }

        throw new Error("Browser's test function is not valid");
      });

      if (browserDescriptor) {
        this.parsedResult.browser = browserDescriptor.describe(this.getUA());
      }

      return this.parsedResult.browser;
    }

    /**
     * Get parsed browser object
     * @return {Object}
     *
     * @public
     */
    getBrowser() {
      if (this.parsedResult.browser) {
        return this.parsedResult.browser;
      }

      return this.parseBrowser();
    }

    /**
     * Get browser's name
     * @return {String} Browser's name or an empty string
     *
     * @public
     */
    getBrowserName(toLowerCase) {
      if (toLowerCase) {
        return String(this.getBrowser().name).toLowerCase() || "";
      }
      return this.getBrowser().name || "";
    }

    /**
     * Get browser's version
     * @return {String} version of browser
     *
     * @public
     */
    getBrowserVersion() {
      return this.getBrowser().version;
    }

    /**
     * Get OS
     * @return {Object}
     *
     * @example
     * this.getOS();
     * {
     *   name: 'macOS',
     *   version: '10.11.12'
     * }
     */
    getOS() {
      if (this.parsedResult.os) {
        return this.parsedResult.os;
      }

      return this.parseOS();
    }

    /**
     * Parse OS and save it to this.parsedResult.os
     * @return {*|{}}
     */
    parseOS() {
      this.parsedResult.os = {};

      const os = Utils.find(osParsersList, (_os) => {
        if (typeof _os.test === "function") {
          return _os.test(this);
        }

        if (_os.test instanceof Array) {
          return _os.test.some((condition) => this.test(condition));
        }

        throw new Error("Browser's test function is not valid");
      });

      if (os) {
        this.parsedResult.os = os.describe(this.getUA());
      }

      return this.parsedResult.os;
    }

    /**
     * Get OS name
     * @param {Boolean} [toLowerCase] return lower-cased value
     * @return {String} name of the OS — macOS, Windows, Linux, etc.
     */
    getOSName(toLowerCase) {
      const { name } = this.getOS();

      if (toLowerCase) {
        return String(name).toLowerCase() || "";
      }

      return name || "";
    }

    /**
     * Get OS version
     * @return {String} full version with dots ('10.11.12', '5.6', etc)
     */
    getOSVersion() {
      return this.getOS().version;
    }

    /**
     * Get parsed platform
     * @return {{}}
     */
    getPlatform() {
      if (this.parsedResult.platform) {
        return this.parsedResult.platform;
      }

      return this.parsePlatform();
    }

    /**
     * Get platform name
     * @param {Boolean} [toLowerCase=false]
     * @return {*}
     */
    getPlatformType(toLowerCase = false) {
      const { type } = this.getPlatform();

      if (toLowerCase) {
        return String(type).toLowerCase() || "";
      }

      return type || "";
    }

    /**
     * Get parsed platform
     * @return {{}}
     */
    parsePlatform() {
      this.parsedResult.platform = {};

      const platform = Utils.find(platformParsersList, (_platform) => {
        if (typeof _platform.test === "function") {
          return _platform.test(this);
        }

        if (_platform.test instanceof Array) {
          return _platform.test.some((condition) => this.test(condition));
        }

        throw new Error("Browser's test function is not valid");
      });

      if (platform) {
        this.parsedResult.platform = platform.describe(this.getUA());
      }

      return this.parsedResult.platform;
    }

    /**
     * Get parsed engine
     * @return {{}}
     */
    getEngine() {
      if (this.parsedResult.engine) {
        return this.parsedResult.engine;
      }

      return this.parseEngine();
    }

    /**
     * Get engines's name
     * @return {String} Engines's name or an empty string
     *
     * @public
     */
    getEngineName(toLowerCase) {
      if (toLowerCase) {
        return String(this.getEngine().name).toLowerCase() || "";
      }
      return this.getEngine().name || "";
    }

    /**
     * Get parsed platform
     * @return {{}}
     */
    parseEngine() {
      this.parsedResult.engine = {};

      const engine = Utils.find(enginesParsersList, (_engine) => {
        if (typeof _engine.test === "function") {
          return _engine.test(this);
        }

        if (_engine.test instanceof Array) {
          return _engine.test.some((condition) => this.test(condition));
        }

        throw new Error("Browser's test function is not valid");
      });

      if (engine) {
        this.parsedResult.engine = engine.describe(this.getUA());
      }

      return this.parsedResult.engine;
    }

    /**
     * Parse full information about the browser
     * @returns {Parser}
     */
    parse() {
      this.parseBrowser();
      this.parseOS();
      this.parsePlatform();
      this.parseEngine();

      return this;
    }

    /**
     * Get parsed result
     * @return {ParsedResult}
     */
    getResult() {
      return Utils.assign({}, this.parsedResult);
    }

    /**
     * Check if parsed browser matches certain conditions
     *
     * @param {Object} checkTree It's one or two layered object,
     * which can include a platform or an OS on the first layer
     * and should have browsers specs on the bottom-laying layer
     *
     * @returns {Boolean|undefined} Whether the browser satisfies the set conditions or not.
     * Returns `undefined` when the browser is no described in the checkTree object.
     *
     * @example
     * const browser = Bowser.getParser(window.navigator.userAgent);
     * if (browser.satisfies({chrome: '>118.01.1322' }))
     * // or with os
     * if (browser.satisfies({windows: { chrome: '>118.01.1322' } }))
     * // or with platforms
     * if (browser.satisfies({desktop: { chrome: '>118.01.1322' } }))
     */
    satisfies(checkTree) {
      const platformsAndOSes = {};
      let platformsAndOSCounter = 0;
      const browsers = {};
      let browsersCounter = 0;

      const allDefinitions = Object.keys(checkTree);

      allDefinitions.forEach((key) => {
        const currentDefinition = checkTree[key];
        if (typeof currentDefinition === "string") {
          browsers[key] = currentDefinition;
          browsersCounter += 1;
        } else if (typeof currentDefinition === "object") {
          platformsAndOSes[key] = currentDefinition;
          platformsAndOSCounter += 1;
        }
      });

      if (platformsAndOSCounter > 0) {
        const platformsAndOSNames = Object.keys(platformsAndOSes);
        const OSMatchingDefinition = Utils.find(platformsAndOSNames, (name) => this.isOS(name));

        if (OSMatchingDefinition) {
          const osResult = this.satisfies(platformsAndOSes[OSMatchingDefinition]);

          if (osResult !== void 0) {
            return osResult;
          }
        }

        const platformMatchingDefinition = Utils.find(platformsAndOSNames, (name) => this.isPlatform(name));
        if (platformMatchingDefinition) {
          const platformResult = this.satisfies(platformsAndOSes[platformMatchingDefinition]);

          if (platformResult !== void 0) {
            return platformResult;
          }
        }
      }

      if (browsersCounter > 0) {
        const browserNames = Object.keys(browsers);
        const matchingDefinition = Utils.find(browserNames, (name) => this.isBrowser(name, true));

        if (matchingDefinition !== void 0) {
          return this.compareVersion(browsers[matchingDefinition]);
        }
      }

      return undefined;
    }

    /**
     * Check if the browser name equals the passed string
     * @param browserName The string to compare with the browser name
     * @param [includingAlias=false] The flag showing whether alias will be included into comparison
     * @returns {boolean}
     */
    isBrowser(browserName, includingAlias = false) {
      const defaultBrowserName = this.getBrowserName().toLowerCase();
      let browserNameLower = browserName.toLowerCase();
      const alias = Utils.getBrowserTypeByAlias(browserNameLower);

      if (includingAlias && alias) {
        browserNameLower = alias.toLowerCase();
      }
      return browserNameLower === defaultBrowserName;
    }

    compareVersion(version) {
      let expectedResults = [0];
      let comparableVersion = version;
      let isLoose = false;

      const currentBrowserVersion = this.getBrowserVersion();

      if (typeof currentBrowserVersion !== "string") {
        return void 0;
      }

      if (version[0] === ">" || version[0] === "<") {
        comparableVersion = version.substr(1);
        if (version[1] === "=") {
          isLoose = true;
          comparableVersion = version.substr(2);
        } else {
          expectedResults = [];
        }
        if (version[0] === ">") {
          expectedResults.push(1);
        } else {
          expectedResults.push(-1);
        }
      } else if (version[0] === "=") {
        comparableVersion = version.substr(1);
      } else if (version[0] === "~") {
        isLoose = true;
        comparableVersion = version.substr(1);
      }

      return expectedResults.indexOf(Utils.compareVersions(currentBrowserVersion, comparableVersion, isLoose)) > -1;
    }

    isOS(osName) {
      return this.getOSName(true) === String(osName).toLowerCase();
    }

    isPlatform(platformType) {
      return this.getPlatformType(true) === String(platformType).toLowerCase();
    }

    isEngine(engineName) {
      return this.getEngineName(true) === String(engineName).toLowerCase();
    }

    /**
     * Is anything? Check if the browser is called "anything",
     * the OS called "anything" or the platform called "anything"
     * @param {String} anything
     * @param [includingAlias=false] The flag showing whether alias will be included into comparison
     * @returns {Boolean}
     */
    is(anything, includingAlias = false) {
      return this.isBrowser(anything, includingAlias) || this.isOS(anything) || this.isPlatform(anything);
    }

    /**
     * Check if any of the given values satisfies this.is(anything)
     * @param {String[]} anythings
     * @returns {Boolean}
     */
    some(anythings = []) {
      return anythings.some((anything) => this.is(anything));
    }
  }

  /*!
   * Bowser - a browser detector
   * https://github.com/lancedikson/bowser
   * MIT License | (c) Dustin Diaz 2012-2015
   * MIT License | (c) Denis Demchenko 2015-2019
   */

  /**
   * Bowser class.
   * Keep it simple as much as it can be.
   * It's supposed to work with collections of {@link Parser} instances
   * rather then solve one-instance problems.
   * All the one-instance stuff is located in Parser class.
   *
   * @class
   * @classdesc Bowser is a static object, that provides an API to the Parsers
   * @hideconstructor
   */
  class Bowser {
    /**
     * Creates a {@link Parser} instance
     *
     * @param {String} UA UserAgent string
     * @param {Boolean} [skipParsing=false] Will make the Parser postpone parsing until you ask it
     * explicitly. Same as `skipParsing` for {@link Parser}.
     * @returns {Parser}
     * @throws {Error} when UA is not a String
     *
     * @example
     * const parser = Bowser.getParser(window.navigator.userAgent);
     * const result = parser.getResult();
     */
    static getParser(UA, skipParsing = false) {
      if (typeof UA !== "string") {
        throw new Error("UserAgent should be a string");
      }
      return new Parser(UA, skipParsing);
    }

    /**
     * Creates a {@link Parser} instance and runs {@link Parser.getResult} immediately
     *
     * @param UA
     * @return {ParsedResult}
     *
     * @example
     * const result = Bowser.parse(window.navigator.userAgent);
     */
    static parse(UA) {
      return new Parser(UA).getResult();
    }

    static get BROWSER_MAP() {
      return BROWSER_MAP;
    }

    static get ENGINE_MAP() {
      return ENGINE_MAP;
    }

    static get OS_MAP() {
      return OS_MAP;
    }

    static get PLATFORMS_MAP() {
      return PLATFORMS_MAP;
    }
  }

  const records = [];
  const addInterceptor = (urlPattern, interceptor, overrideResponse = false) => {
    records.unshift({ urlPattern, interceptor, overrideResponse });
  };
  const getInterceptRecordForUrl = (url) => {
    return records.find(({ urlPattern }) => urlPattern.test(url));
  };
  const clearInterceptors = () => {
    records.length = 0;
  };

  exports.ApiType = void 0;
  (function (ApiType) {
    ApiType["XHR"] = "xmlhttprequest";
    ApiType["FETCH"] = "fetch";
  })(exports.ApiType || (exports.ApiType = {}));

  const getAbsoluteUrl = (url) => {
    const dummyLink = document.createElement("a");
    dummyLink.href = url;
    return dummyLink.href;
  };
  const jsonifyIfPossible = (value) => {
    if (!value) {
      return value;
    }
    try {
      let jsonString;
      if (value instanceof FormData) {
        jsonString = JSON.stringify(Object.fromEntries(value));
      } else if (value.buffer instanceof ArrayBuffer) {
        jsonString = new TextDecoder().decode(value.buffer);
      } else if (typeof value !== "string") {
        jsonString = JSON.stringify(value);
      }
      return JSON.parse(jsonString);
    } catch (e) {
      // no-op
    }
    return value;
  };
  const convertSearchParamsToJSON = (url) => {
    const result = {};
    if (!url || url === "?" || url.indexOf("?") === -1) {
      return result;
    }
    const paramsObject = Object.fromEntries(new URL(url).searchParams);
    Object.entries(paramsObject).forEach(([paramName, paramValue]) => {
      result[paramName] = jsonifyIfPossible(paramValue);
    });
    return result;
  };
  const parseHeaders = (headers) => {
    if (headers instanceof Headers) {
      return Array.from(headers).reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
    } else if (Array.isArray(headers)) {
      return headers.reduce((obj, [key, val]) => {
        obj[key] = val;
        return obj;
      }, {});
    }
    return headers;
  };
  const getCustomResponse = async (interceptor, args, isJsonResponse) => {
    const customResponse = await interceptor(args);
    if (customResponse) {
      if (typeof customResponse === "object" && isJsonResponse) {
        customResponse.body = JSON.stringify(customResponse);
      }
      if (args.status === 204) {
        customResponse.status = 200;
      }
      return {
        body: args.response,
        headers: args.responseHeaders,
        status: args.status,
        statusText: args.statusText,
        ...customResponse,
      };
    }
    return null;
  };
  const isJsonResponse = (response) => {
    return response.headers.get("content-type")?.indexOf("application/json") !== -1;
  };

  const onReadyStateChange = async function () {
    if (this.readyState === 4) {
      const { interceptor, overrideResponse } = getInterceptRecordForUrl(this.url) || {};
      if (!interceptor) {
        return;
      }
      const responseTime = Math.floor(performance.now() - this.startTime);
      const responseHeaders = {};
      this.getAllResponseHeaders()
        .trim()
        .split(/[\r\n]+/)
        .forEach((line) => {
          const parts = line.split(": ");
          const header = parts.shift();
          const value = parts.join(": ");
          responseHeaders[header] = value;
        });
      const responseType = this.responseType;
      let requestData;
      if (this.method === "POST") {
        requestData = jsonifyIfPossible(this.requestData);
      } else {
        requestData = convertSearchParamsToJSON(this.url);
      }
      const interceptorArgs = {
        api: exports.ApiType.XHR,
        responseTime,
        method: this.method,
        url: this.url,
        requestHeaders: this.requestHeaders,
        requestData,
        responseType: this.responseType,
        response: this.response,
        responseURL: this.responseURL,
        responseJSON: jsonifyIfPossible(this.response),
        responseHeaders,
        status: this.status,
        statusText: this.statusText,
        contentType: responseHeaders["content-type"],
      };
      // if response is not to be overridden, do not wait for interceptor to finish execution
      if (!overrideResponse) {
        if (this.response instanceof Blob) {
          this.response.text().then((responseText) => {
            interceptor({
              ...interceptorArgs,
              response: responseText,
              responseJSON: jsonifyIfPossible(responseText),
            });
          });
        } else {
          interceptor(interceptorArgs);
        }
        return;
      }
      const isJsonResponse = responseType === "json";
      const customResponse = await getCustomResponse(interceptor, interceptorArgs, isJsonResponse);
      if (!customResponse) {
        // nothing to override
        return;
      }
      Object.defineProperty(this, "response", {
        get() {
          if (isJsonResponse) {
            if (typeof customResponse.body === "object") {
              return customResponse.body;
            }
            return jsonifyIfPossible(customResponse.body);
          }
          return customResponse.body;
        },
      });
      if (responseType === "" || responseType === "text") {
        Object.defineProperty(this, "responseText", { get: () => customResponse.body });
      }
      Object.defineProperty(this, "status", { get: () => customResponse.status });
      Object.defineProperty(this, "statusText", { get: () => customResponse.statusText });
      Object.defineProperty(this, "headers", { get: () => customResponse.headers });
    }
  };
  const XHR = XMLHttpRequest;
  // @ts-ignore
  XMLHttpRequest = function () {
    const xhr = new XHR();
    xhr.addEventListener("readystatechange", onReadyStateChange.bind(xhr), false);
    return xhr;
  };
  XMLHttpRequest.prototype = XHR.prototype;
  Object.entries(XHR).map(([key, val]) => {
    XMLHttpRequest[key] = val;
  });
  const open = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function (method, url) {
    this.method = method;
    this.startTime = performance.now();
    this.url = getAbsoluteUrl(url);
    open.apply(this, arguments);
  };
  const send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.send = function (data) {
    this.requestData = data;
    send.apply(this, arguments);
  };
  const setRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
  XMLHttpRequest.prototype.setRequestHeader = function (header, value) {
    this.requestHeaders = this.requestHeaders || {};
    this.requestHeaders[header] = value;
    setRequestHeader.apply(this, arguments);
  };
  ["DONE", "HEADERS_RECEIVED", "LOADING", "OPENED", "UNSENT"].forEach((extraXHRProperty) => {
    XMLHttpRequest[extraXHRProperty] = XHR[extraXHRProperty];
  });

  const getInterceptorArgs = async (url, request, response, responseTime) => {
    const method = request.method;
    const requestHeaders = parseHeaders(request.headers);
    let requestData;
    if (method === "POST") {
      requestData = jsonifyIfPossible(await request.text());
    } else {
      requestData = convertSearchParamsToJSON(url);
    }
    const responseData = await response.text();
    const responseHeaders = parseHeaders(response.headers);
    const responseDataAsJson = jsonifyIfPossible(responseData);
    return {
      api: exports.ApiType.FETCH,
      method,
      url,
      requestHeaders,
      requestData,
      response: responseData,
      responseURL: response.url,
      responseJSON: responseDataAsJson,
      responseHeaders,
      contentType: responseHeaders["content-type"],
      responseTime,
      status: response.status,
      statusText: response.statusText,
    };
  };
  const _fetch = fetch;
  // @ts-ignore
  fetch = async (resource, initOptions = {}) => {
    const getOriginalResponse = () => _fetch(resource, initOptions);
    let request;
    if (resource instanceof Request) {
      request = resource.clone();
    } else {
      request = new Request(resource.toString(), initOptions);
    }
    const url = getAbsoluteUrl(request.url);
    const startTime = performance.now();
    const originalResponse = await getOriginalResponse();
    const responseTime = Math.floor(performance.now() - startTime);
    const { interceptor, overrideResponse } = getInterceptRecordForUrl(url) || {};
    if (!interceptor) {
      return originalResponse;
    }
    const response = originalResponse.clone();
    if (!overrideResponse) {
      // do not wait for interceptor to finish execution
      getInterceptorArgs(url, request, response, responseTime).then(interceptor);
      return originalResponse;
    }
    const interceptorArgs = await getInterceptorArgs(url, request, response, responseTime);
    const customResponse = await getCustomResponse(interceptor, interceptorArgs, isJsonResponse(response));
    if (!customResponse) {
      // nothing to override, return original response
      return originalResponse;
    }
    return new Response(new Blob([customResponse.body]), {
      status: customResponse.status,
      statusText: customResponse.statusText,
      headers: customResponse.headers,
    });
  };

  const Network = {
    intercept: addInterceptor,
    clearInterceptors,
  };

  const isMediaRequest = (contentType) => {
    const regexExp = /^(image|audio|video)\/.+$/gi;
    return regexExp?.test(contentType);
  };
  const getObjectSizeInBytes = (obj) => {
    if (!obj) {
      return NaN;
    }
    let stringifiedObj = obj;
    try {
      if (typeof obj !== "string") {
        stringifiedObj = JSON.stringify(obj);
      }
    } catch (e) {
      return NaN;
    }
    const size = stringifiedObj.length;
    return size;
  };

  const POST_MESSAGE_SOURCE = "requestly:websdk:sessionRecorder";
  const RELAY_EVENT_MESSAGE_ACTION = "relayEventToTopDocument";
  const DEFAULT_MAX_DURATION = 5 * 60 * 1000;
  class SessionRecorder {
    #options;
    #stopRecording;
    #url;
    #environment;
    #lastTwoSessionEvents;
    constructor(options) {
      this.#options = {
        ...options,
        maxDuration: options.maxDuration ?? DEFAULT_MAX_DURATION,
        relayEventsToTop: options.relayEventsToTop && window.top !== window,
        ignoreMediaResponse: options.ignoreMediaResponse ?? true,
        maxPayloadSize: options.maxPayloadSize ?? 100 * 1024, // 100KB max payload size of any request/response
      };
      this.#url = window.location.href;
      if (!this.#options.relayEventsToTop) {
        this.#captureEnvironment();
        window.addEventListener("message", (message) => {
          if (message.data.source !== POST_MESSAGE_SOURCE) {
            return;
          }
          if (message.data.action === RELAY_EVENT_MESSAGE_ACTION) {
            const { eventType, event, url } = message.data.payload;
            this.#addEvent(eventType, {
              ...event,
              frameUrl: url,
            });
          }
        });
      }
    }
    start() {
      const plugins = [];
      if (this.#options.console) {
        plugins.push(getRecordConsolePlugin());
      }
      const commonRrwebOptions = {
        recordAfter: "DOMContentLoaded",
        recordCrossOriginIframes: true,
        blockClass: "rq-element",
      };
      if (this.#options.relayEventsToTop) {
        if (this.#isCrossDomainFrame()) {
          // RRWeb already handles events for same domain frames
          this.#stopRecording = record({
            plugins,
            ...commonRrwebOptions,
            emit: (event) => {
              if (event.type === EventType.Plugin && event.data.plugin === PLUGIN_NAME) {
                this.#relayEventToTopDocument(exports.RQSessionEventType.RRWEB, event);
              }
            },
          });
        }
        this.#interceptNetworkRequests((event) => {
          this.#relayEventToTopDocument(exports.RQSessionEventType.NETWORK, event);
        });
        return;
      }
      const lastSessionEvents = this.#options.previousSession?.events ?? this.#getEmptySessionEvents();
      this.#lastTwoSessionEvents = [this.#getEmptySessionEvents(), lastSessionEvents];
      this.#stopRecording = record({
        plugins,
        ...commonRrwebOptions,
        checkoutEveryNms: this.#options.maxDuration,
        emit: (event, isCheckout) => {
          if (isCheckout) {
            const previousSessionEvents = this.#lastTwoSessionEvents[1];
            const previousSessionRRWebEvents = previousSessionEvents[exports.RQSessionEventType.RRWEB];
            if (previousSessionRRWebEvents.length > 1) {
              const timeElapsedInBucket =
                previousSessionRRWebEvents[previousSessionRRWebEvents.length - 1].timestamp -
                previousSessionRRWebEvents[0].timestamp;
              // final session duration should be between T and 2T where T is maxDuration
              if (timeElapsedInBucket >= this.#options.maxDuration) {
                this.#lastTwoSessionEvents = [previousSessionEvents, this.#getEmptySessionEvents()];
              }
            }
          }
          this.#addEvent(exports.RQSessionEventType.RRWEB, event);
        },
      });
      this.#interceptNetworkRequests((event) => {
        this.#addEvent(exports.RQSessionEventType.NETWORK, event);
      });
    }
    stop() {
      this.#stopRecording?.();
      this.#stopRecording = null;
      Network.clearInterceptors();
    }
    getSession() {
      if (this.#options.relayEventsToTop) {
        return null;
      }
      const events = {};
      Object.values(exports.RQSessionEventType).forEach((eventType) => {
        events[eventType] = this.#lastTwoSessionEvents[0][eventType].concat(this.#lastTwoSessionEvents[1][eventType]);
      });
      const rrwebEvents = events[exports.RQSessionEventType.RRWEB];
      const firstEventTime = rrwebEvents[0]?.timestamp;
      const lastEventTime = rrwebEvents[rrwebEvents.length - 1]?.timestamp;
      return {
        attributes: {
          url: this.#options.previousSession?.attributes.url ?? this.#url,
          startTime: firstEventTime,
          duration: lastEventTime - firstEventTime,
          environment: this.#options.previousSession?.attributes.environment ?? this.#environment,
        },
        events,
      };
    }
    #interceptNetworkRequests(captureEventFn) {
      if (!this.#options.network) {
        return;
      }
      Network.intercept(
        /.*/,
        ({ method, url, requestData, responseJSON, responseURL, contentType, status, statusText, responseTime }) => {
          captureEventFn(
            this.#filterOutLargeNetworkValues({
              timestamp: Date.now(),
              method,
              url,
              requestData,
              response: responseJSON,
              responseURL,
              contentType,
              status,
              statusText,
              responseTime,
            })
          );
        }
      );
    }
    #addEvent(eventType, event) {
      const previousSessionEvents = this.#lastTwoSessionEvents[1]?.[eventType];
      // DOMContentLoaded events sometimes come out of order
      if (event.type === EventType.DomContentLoaded) {
        const insertIndex = previousSessionEvents?.findIndex((arrayEvent) => event.timestamp < arrayEvent.timestamp);
        if (insertIndex > -1) {
          previousSessionEvents?.splice(insertIndex, 0, event);
          return;
        }
      }
      previousSessionEvents?.push(event);
    }
    #isCrossDomainFrame() {
      try {
        if (window.parent.document !== null) {
          // can access parent frame -> not a cross domain frame
          return false;
        }
      } catch (e) {}
      return true;
    }
    #captureEnvironment() {
      const userAgent = window.navigator.userAgent;
      const parsedEnvironment = Bowser.parse(userAgent);
      this.#environment = {
        userAgent,
        language: window.navigator.languages?.[0] || window.navigator.language,
        browser: parsedEnvironment.browser,
        os: parsedEnvironment.os,
        // @ts-ignore
        platform: parsedEnvironment.platform,
        browserDimensions: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        screenDimensions: {
          width: window.screen.width,
          height: window.screen.height,
        },
        devicePixelRatio: window.devicePixelRatio,
      };
    }
    #getEmptySessionEvents() {
      const emptySessionEvents = {};
      Object.values(exports.RQSessionEventType).forEach((eventType) => {
        emptySessionEvents[eventType] = [];
      });
      return emptySessionEvents;
    }
    #relayEventToTopDocument(eventType, event) {
      window.top.postMessage(
        {
          source: POST_MESSAGE_SOURCE,
          action: RELAY_EVENT_MESSAGE_ACTION,
          payload: {
            eventType,
            event,
            url: this.#url,
          },
        },
        "*"
      );
    }
    #filterOutLargeNetworkValues(networkEventData) {
      const errors = [];
      if (this.#options.ignoreMediaResponse && isMediaRequest(networkEventData.contentType)) {
        networkEventData.response = "";
      } else {
        const responseBodySize = getObjectSizeInBytes(networkEventData.response);
        if (responseBodySize > this.#options.maxPayloadSize) {
          networkEventData.response = "";
          errors.push(exports.RQNetworkEventErrorCodes.RESPONSE_TOO_LARGE);
        }
      }
      const requestDataSize = getObjectSizeInBytes(networkEventData.requestData);
      if (requestDataSize > this.#options.maxPayloadSize) {
        networkEventData.requestData = "";
        errors.push(exports.RQNetworkEventErrorCodes.REQUEST_TOO_LARGE);
      }
      return { ...networkEventData, errors };
    }
  }

  const VERSION = "0.14.2";

  exports.Network = Network;
  exports.SessionRecorder = SessionRecorder;
  exports.VERSION = VERSION;

  Object.defineProperty(exports, "__esModule", { value: true });

  return exports;
})({});
