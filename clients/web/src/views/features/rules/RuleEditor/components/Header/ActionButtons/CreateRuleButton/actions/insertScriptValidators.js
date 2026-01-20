import { parse } from "acorn";
import { simple } from "acorn-walk";
import { HtmlValidate, StaticConfigLoader } from "html-validate";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";

/* LOGICAL VALIDATORS - currently not being fully applied */
export const SCRIPT_LOGICAL_ERRORS = {
  DOM_LOAD_EVENT_LISTENER_AFTER_PAGE_LOAD: "dom_load_event_listener_after_page_load",
  CONTAINS_NON_JS_CSS: "contains_non_js_css",
};

export function checkForLogicalErrorsInCode(code, script) {
  if (!isJSOrCSS(code)) {
    return {
      isValid: false,
      error: SCRIPT_LOGICAL_ERRORS.CONTAINS_NON_JS_CSS,
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
      error: SCRIPT_LOGICAL_ERRORS.DOM_LOAD_EVENT_LISTENER_AFTER_PAGE_LOAD,
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

    return hasLoadListener;
  } catch (error) {
    console.error("Error parsing code:", error);
    return false;
  }
}

/* HACK: For now we verify this by confirming that this is not HTML code */
function isJSOrCSS(code) {
  try {
    const doc = new DOMParser().parseFromString(code, "text/html");
    return !isHTMLString(code, doc);
  } catch (error) {
    console.error("Error parsing code:", error);
    return true;
  }
}

/* HTML VALIDATORS */
export const HTML_ERRORS = {
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
 *
 * @param {string} str string containing HTML snippet
 * @param {Document} doc Document created from the HTML string
 * @returns {boolean}
 */
export async function validateHTMLTag(str, htmlNodeName) {
  const HTMLLinterResult = await htmlValidateRawCodeString(str);

  if (
    !HTMLLinterResult.isValid &&
    !HTMLLinterResult.validationErrors.find((ele) => ele.errorType === "unclosed_tags")
  ) {
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
        validationError: HTML_ERRORS.NO_TAGS,
        errorMessage: `No ${htmlNodeName} tags found in the script block`,
      };
    }

    if (nodes.length > 1) {
      return {
        isValid: false,
        validationError: HTML_ERRORS.MULTIPLE_TAGS,
        errorMessage: `Multiple ${htmlNodeName} tags found in the document. Only one is allowed.`,
      };
    }

    if (checkDocumentForAnyOtherNode(doc, htmlNodeName)) {
      return {
        isValid: false,
        validationError: HTML_ERRORS.UNSUPPORTED_TAGS,
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

export const removeUrlAttribute = (attributes, codeType) => {
  const urlAttrName = codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? "src" : "href";

  return attributes?.filter((attr) => attr.name !== urlAttrName) ?? [];
};

/* Pass the code string through an HTML linter and return errors if any */
async function htmlValidateRawCodeString(codeString) {
  const loader = new StaticConfigLoader({
    extends: ["html-validate:recommended"],
    elements: ["html5"],
  });
  const htmlvalidate = new HtmlValidate(loader);

  return htmlvalidate
    .validateString(codeString)
    .then((report) => {
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
                errorType: HTML_ERRORS.COULD_NOT_PARSE,
              });
            }
            if (errMessage.ruleId === "close-order" || errMessage.ruleId === "script-element") {
              validationErrors.push({
                message: errMessage.message,
                errorType: HTML_ERRORS.UNCLOSED_TAGS,
              });
            }
            if (errMessage.ruleId === "close-attr") {
              validationErrors.push({
                message: errMessage.message,
                errorType: HTML_ERRORS.UNCLOSED_ATTRIBUTES,
              });
            }
          });
        }
      });

      return {
        isValid: validationErrors.length === 0,
        validationErrors,
      };
    })
    .catch((error) => {
      console.error("Error validating HTML string:", error);
      return {
        isValid: true, // htmlValidate Errors out sometimes, so we return true
        validationErrors: [{ message: "Error validating HTML string", errorType: HTML_ERRORS.COULD_NOT_PARSE }],
      };
    });
}

/**
 * Check if the given string contains HTML nodes
 * @param {string} str string containing HTML snippet
 * @param {Document} generatedDocument Document created from the HTML string
 * @returns {boolean}
 */
function isHTMLString(str, generatedDocument) {
  const defaultResponse = false;
  if (!str) return defaultResponse;

  // check if body and head is just empty
  if (generatedDocument.body.childNodes.length === 0 && generatedDocument.head.childNodes.length === 0) {
    /* since string exists, but doc is empty, this implies there was an error parsing it into the document */
    return defaultResponse;
  }

  return (
    // nodeType 1 is for element nodes
    /* Array.from(generatedDocument.body.childNodes).some((node) => node.nodeType === 1) || // most nodes end up in body */ // commenting since being this thorough is causing issues
    Array.from(generatedDocument.head.childNodes).some((node) => node.nodeType === 1) // special nodes like link and style end up in head
  );
}

/**
 * Checks if the document has nodes other than the given nodeName
 * @param {Document} doc document to be checked. This is expected to be created from some HTML snippet string
 * @param {string} nodeName name of the node that is expected to be present in the document
 * @returns {boolean}
 */
function checkDocumentForAnyOtherNode(doc, nodeName) {
  const defaultResponse = false;
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
 * Parsing the attributes and the innerText of the HTML string
 *
 * @param {string} rawCode string containing HTML snipper
 * @param {string} htmlNodeName name of the HTML node
 * @returns  {{
 *  innerText: string,
 *  attributes: Array<{name: string, value: string}>,
 * }}
 */
export function parseHTMLString(rawCode, htmlNodeName) {
  const details = extractDOMNodeDetails(rawCode, htmlNodeName); // todo: replace this call

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
    err: "Unexpected Error while parsing code",
  };
}

export function getHTMLNodeName(scriptType, codeType) {
  let htmlNode = "";
  if (codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
    htmlNode = "script";
  } else {
    // CSS
    if (scriptType === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
      htmlNode = "link";
    } else {
      htmlNode = "style";
    }
  }
  return htmlNode;
}

function extractDOMNodeDetails(htmlCodeString, nodeName) {
  if (!nodeName || nodeName === "body") throw new Error("htmlElementName is empty");
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlCodeString, "text/html");
  const blocks = doc.getElementsByTagName(nodeName) ?? [];
  return Array.from(blocks).map((htmlBlock) => {
    console.log("DBG: extractDOMNodeDetails: htmlBlock", htmlBlock);
    const innerText = getInnerMostText(htmlBlock.innerText, nodeName);
    console.log("DBG: extractDOMNodeDetails: innerText", innerText);
    return {
      innerText,
      attributes: Array.from(htmlBlock.attributes).map((attr) => ({ name: attr.name, value: attr.value })),
      parent: htmlBlock.parentNode,
      html: htmlBlock.outerHTML,
      originalCode: htmlCodeString,
    };
  });
}

function getInnerMostText(caseString, htmlElementName) {
  const openingTag = `<${htmlElementName}`;
  const openingTagStartIndex = caseString.lastIndexOf(openingTag);
  let innerTextStart = 0;
  if (openingTagStartIndex !== -1) {
    const openingTagEndIndex = caseString.indexOf(">", openingTagStartIndex);
    if (openingTagEndIndex === -1) {
      console.error("Unexpected error, no closing tag delimiter found");
      innerTextStart = openingTagStartIndex + openingTag.length + 1;
    } else {
      innerTextStart = openingTagEndIndex + 1;
    }
  }

  let innerTextEnd = caseString.length;
  const closingTag = `</${htmlElementName}>`;
  const closingTagIndex = caseString.indexOf(closingTag);
  if (closingTagIndex !== -1) {
    innerTextEnd = closingTagIndex;
  }

  if (innerTextEnd < innerTextStart) {
    console.error(
      "Unexpected Nesting case, basic sanitization cannot fix this, please ask user to fix",
      caseString,
      htmlElementName
    );
    // returning unprocessed string
    return caseString;
  }

  const innerText = caseString.slice(innerTextStart, innerTextEnd);
  return innerText;
}
