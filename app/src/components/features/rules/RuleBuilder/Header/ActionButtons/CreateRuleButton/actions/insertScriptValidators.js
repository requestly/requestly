import { parse } from "acorn";
import { simple } from "acorn-walk";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const invalidHTMLError = {
  UNCLOSED_TAGS: "unclosed_tags",
  UNSUPPORTED_TAGS: "unsupported_tags",
};

export const scriptLogicalErrors = {
  DOM_LOAD_EVENT_LISTENER_AFTER_PAGE_LOAD: "dom_load_event_listener_after_page_load",
  CONTAINS_HTML_CODE: "contains_html_code",
};

export function checkForLogicalErrorsInCode(code, script) {
  if (isHTMLNodeString(code)) {
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

function isHTMLNodeString(code) {
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

export function doesDocumentHaveOtherNodes(code, nodeName) {
  try {
    const doc = new DOMParser().parseFromString(code, "text/html");
    return (
      // nodeType 1 is for element nodes
      Array.from(doc.body.childNodes).some((node) => node.nodeType === 1 && node.nodeName !== nodeName) || // most nodes end up in body
      Array.from(doc.head.childNodes).some((node) => node.nodeType === 1 && node.nodeName !== nodeName) // special nodes like link and style end up in head
    );
  } catch (error) {
    console.error("Error parsing code:", error);
    return false;
  }
}

export function parseAndValidateHTMLCodeStringForSpecificHTMLNodeType(htmlCodeString, htmlNodeName) {
  const result = {
    innerCode: "",
    parsedCodeBlocks: [],
    validationResult: {
      isValid: true,
      validationError: [],
    },
  };

  const parsedCodeBlocks = extractDomNodeDetailsFromHTMLCodeString(htmlCodeString, htmlNodeName);
  result.parsedCodeBlocks = parsedCodeBlocks;

  parsedCodeBlocks.forEach((codeBlock) => {
    const { isValid, validationError } = isValidHTMLNode(codeBlock);

    result.innerCode += codeBlock.innerText;
    result.validationResult.isValid = result.validationResult.isValid && isValid;
    if (validationError) result.validationResult.validationError.push(validationError);
  });
  return result;
}

export function extractDomNodeDetailsFromHTMLCodeString(htmlCodeString, nodeName) {
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

export function isValidHTMLNode(codeblock) {
  // this means the script had tags other than script or style
  if (codeblock.parent.nodeName !== "HEAD") {
    console.debug("invalid html tag", codeblock.parent.nodeName, codeblock);

    return {
      isValid: false,
      validationError: invalidHTMLError.UNSUPPORTED_TAGS,
    };
  }
  // this means parsed script is different, so it's possible that the html tags were not correctly closed
  // @nsr todo: couldn't find a foolproof way to check this, so skipping for now
  // if(!codeblock.originalCode.includes(codeblock.html.trim())) {

  //   console.debug("parsed code not found in original code, possible that the html tags were not correctly closed", codeblock);

  //   return {
  //     isValid: false,
  //     validationError: invalidHTMLError.UNCLOSED_TAGS
  //   }
  // }

  return {
    isValid: true,
  };
}
