import { parse } from "acorn";
import { simple } from "acorn-walk";
import { HtmlValidate, StaticConfigLoader } from "html-validate";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

/* LOGICAL VALIDATORS - currently not being fully applied */
export const scriptLogicalErrors = {
  DOM_LOAD_EVENT_LISTENER_AFTER_PAGE_LOAD: "dom_load_event_listener_after_page_load",
  CONTAINS_HTML_CODE: "contains_html_code",
};

export function checkForLogicalErrorsInCode(code, script) {
  if (doesStringContainHTMLSnippet(code)) {
    return {
      isValid: false,
      error: scriptLogicalErrors.CONTAINS_HTML_CODE,
    };
  }

  // update the rule if it has load event listener but the script is loaded after page load
  if (
    script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS &&
    hasLoadEventListener(code) &&
    script.loadTime === GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD
  ) {
    return {
      isValid: false,
      error: scriptLogicalErrors.DOM_LOAD_EVENT_LISTENER_AFTER_PAGE_LOAD,
    };
  }

  return {
    isValid: true,
  };
}

function hasLoadEventListener(code) {
  try {
    const ast = parse(code, { ecmaVersion: 2020, sourceType: "module" });
    let hasLoadListener = false;

    simple(ast, {
      CallExpression(node) {
        if (
          node.callee.type === "MemberExpression" &&
          node.callee.object.type === "Identifier" &&
          (node.callee.object.name === "window" || node.callee.object.name === "document") &&
          node.callee.property.type === "Identifier" &&
          node.callee.property.name === "addEventListener" &&
          node.arguments.length >= 2 &&
          node.arguments[0].type === "Literal" &&
          (node.arguments[0].value === "load" || node.arguments[0].value === "DOMContentLoaded")
        ) {
          hasLoadListener = true;
        }
      },
    });

    console.log("hasLoadListener", hasLoadListener); // todo: remove
    return hasLoadListener;
  } catch (error) {
    console.error("Error parsing code:", error);
    return false;
  }
}

function doesStringContainHTMLSnippet(code) {
  try {
    const doc = new DOMParser().parseFromString(code, "text/html");
    return (
      // nodeType 1 is for element nodes
      Array.from(doc.body.childNodes).some((node) => node.nodeType === 1) || // most nodes end up in body
      Array.from(doc.head.childNodes).some((node) => node.nodeType === 1) // special nodes like link and style end up in head
    );
  } catch (error) {
    console.error("Error parsing code:", error);
    return false;
  }
}

/* HTML VALIDATORS */
export const invalidHTMLError = {
  COULD_NOT_PARSE: "could_not_parse",
  UNCLOSED_TAGS: "unclosed_tags",
  UNCLOSED_ATTRIBUTES: "unclosed_attributes",
  UNSUPPORTED_TAGS: "unsupported_tags",
  MULTIPLE_TAGS: "multiple_tags",
  NO_TAGS: "no_tags",
};

/**
 * Check if the given string contains HTML snippets
 * And if so, validates if the html snippet is correct
 * @param {string} str string containing HTML snippet
 * @param {Document} doc Document created from the HTML string
 * @returns {boolean}
 */
export async function validateStringForSpecificHTMLNode(str, htmlNodeName) {
  const HTMLLinterResult = await htmlValidateRawCodeString(str);
  if (!HTMLLinterResult.isValid) {
    console.log("5");
    return {
      isValid: false,
      validationError: HTMLLinterResult.validationErrors[0].errorType,
      errorMessage: HTMLLinterResult.validationErrors[0].message,
    };
  }

  try {
    const doc = new DOMParser().parseFromString(str, "text/html");

    if (!isHTMLString(str, doc)) {
      return {
        isValid: true,
      };
    }

    const nodes = doc.querySelectorAll(htmlNodeName);
    if (nodes.length === 0) {
      return {
        isValid: false,
        validationError: invalidHTMLError.NO_TAGS,
        errorMessage: "No tags found in the document",
      };
    }

    if (nodes.length > 1) {
      console.log("3");
      return {
        isValid: false,
        validationError: invalidHTMLError.MULTIPLE_TAGS,
        errorMessage: `Multiple ${htmlNodeName} tags found in the document. Only one is allowed.`,
      };
    }

    if (doesDocumentHaveOtherNodes(doc, htmlNodeName)) {
      console.log("4", doc);
      return {
        isValid: false,
        validationError: invalidHTMLError.UNSUPPORTED_TAGS,
        errorMessage: `Only ${htmlNodeName} tags are allowed `,
      };
    }
  } catch (error) {
    console.debug("couldn't parse the document", error);
  }

  return {
    isValid: true,
  };
}

/* Pass the code string through an HTML linter and return errors if any */
async function htmlValidateRawCodeString(codeString) {
  const loader = new StaticConfigLoader({
    extends: ["html-validate:recommended"],
    elements: ["html5"],
  });
  const htmlvalidate = new HtmlValidate(loader);

  const report = await htmlvalidate.validateString(codeString);

  if (report.valid) {
    return {
      isValid: true,
      validationErrors: [],
    };
  }

  const validationErrors = [];

  /* CURRENTLY WE ARE ONLY CONCERNED WITH SPECIFIC ERRORS */

  report.results.forEach((result) => {
    if (result.errorCount > 0) {
      result.messages.forEach((errMessage) => {
        if (errMessage.ruleId === "parser-error") {
          validationErrors.push({
            message: errMessage.message,
            errorType: invalidHTMLError.COULD_NOT_PARSE,
          });
        }
        if (errMessage.ruleId === "close-order" || errMessage.ruleId === "script-element") {
          validationErrors.push({
            message: errMessage.message,
            errorType: invalidHTMLError.UNCLOSED_TAGS,
          });
        }
        if (errMessage.ruleId === "close-attr") {
          validationErrors.push({
            message: errMessage.message,
            errorType: invalidHTMLError.UNCLOSED_ATTRIBUTES,
          });
        }
      });
    }
  });

  return {
    isValid: validationErrors.length === 0,
    validationErrors,
  };
}

/**
 * Check if the given string contains HTML nodes
 * @param {string} str string containing HTML snippet
 * @param {Document} doc Document created from the HTML string
 * @returns {boolean}
 */
function isHTMLString(str, doc) {
  // todo: rename
  const defaultResponse = true;
  if (!str) return defaultResponse;

  // check if body and head is just empty
  if (doc.body.childNodes.length === 0 && doc.head.childNodes.length === 0) {
    /* since string exists, but doc is empty, this implies there was an error parsing it into the document */
    console.log("6");
    return defaultResponse;
  }

  return (
    // nodeType 1 is for element nodes
    Array.from(doc.body.childNodes).some((node) => node.nodeType === 1) || // most nodes end up in body
    Array.from(doc.head.childNodes).some((node) => node.nodeType === 1) // special nodes like link and style end up in head
  );
}

/**
 * Checks if the document has nodes other than the given nodeName
 * @param {Document} doc document to be checked. This is expected to be created from some HTML snippet string
 * @param {string} nodeName name of the node that is expected to be present in the document
 * @returns {boolean}
 */
function doesDocumentHaveOtherNodes(doc, nodeName) {
  const defaultResponse = false; // todo: rename
  try {
    /* nodeType 1 is for element nodes */
    return (
      // most nodes end up in body
      Array.from(doc.body.childNodes).some((node) => node.nodeType === 1 && node.nodeName !== nodeName.toUpperCase()) ||
      // special nodes like link and style end up in head
      Array.from(doc.head.childNodes).some((node) => node.nodeType === 1 && node.nodeName !== nodeName.toUpperCase())
    );
  } catch (error) {
    console.debug("Error parsing code:", error);
    return defaultResponse;
  }
}

/**
 *
 * @param {string} rawCode string containing HTML snipper
 * @param {string} htmlNodeName name of the HTML node
 * @returns  {Object} object containing innerText and attributes
 */
export function extractInnerTextAndAttributesFromHTMLString(rawCode, htmlNodeName) {
  const details = extractDomNodeDetailsFromHTMLCodeString(rawCode, htmlNodeName); // todo: replace this call

  if (!details?.length) {
    return {
      innerText: rawCode,
      attributes: [],
    };
  }
  if (details.length === 1) {
    return {
      innerText: details[0].innerText,
      attributes: details[0].attributes,
    };
  } else if (details.length > 1) {
    return {
      innerText: details[0].innerText,
      attributes: details[0].attributes,
      err: "Multiple HTML Nodes inside the same pair may lead to errors",
    };
  }

  return {
    innerText: undefined,
    attributes: undefined,
    err: "Unexpected Error while parsing code",
  };
}

export function getHTMLNodeName(scriptType, codeType) {
  let htmlNode = "";
  if (codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
    // else CSS
    htmlNode = "script";
  } else if (scriptType === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
    htmlNode = "link";
  } else {
    htmlNode = "style";
  }
  return htmlNode;
}

function extractDomNodeDetailsFromHTMLCodeString(htmlCodeString, nodeName) {
  if (!nodeName || nodeName === "body") throw new Error("htmlElementName is empty");
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlCodeString, "text/html");
  const blocks = doc.getElementsByTagName(nodeName) ?? [];
  return Array.from(blocks).map((htmlBlock) => {
    return {
      innerText: htmlBlock.innerText,
      attributes: Array.from(htmlBlock.attributes).map((attr) => ({ name: attr.name, value: attr.value })),
      parent: htmlBlock.parentNode,
      html: htmlBlock.outerHTML,
      originalCode: htmlCodeString,
    };
  });
}
