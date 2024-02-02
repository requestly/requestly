import { parse } from "acorn";
import { simple } from "acorn-walk";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

export const invalidHTMLError = {
  // todo: move to constants
  UNCLOSED_TAGS: "unclosed_tags",
  UNSUPPORTED_TAGS: "unsupported_tags",
};

export function postProcessCode(code, script, scriptId) {
  // todo: rename
  // update the rule if it has load event listener but the script is loaded after page load
  if (
    script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS &&
    hasLoadEventListener(code) &&
    script.loadTime === GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.AFTER_PAGE_LOAD
  ) {
    return {
      hasLoadEventListener: true,
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
}

export function parseHTMLTagInCodeString(htmlCodeString, tagName) {
  const result = {
    innerCode: "",
    parsedCodeBlocks: [],
    validationResult: {
      isValid: true,
      validationError: [],
    },
  };

  const parsedCodeBlocks = parseSpecificHTMLStringBlocks(htmlCodeString, tagName);
  result.parsedCodeBlocks = parsedCodeBlocks;

  parsedCodeBlocks.forEach((codeBlock) => {
    const { isValid, validationError } = isValidHTMLNode(codeBlock);

    result.innerCode += codeBlock.innerText;
    result.validationResult.isValid = result.validationResult.isValid && isValid;
    if (validationError) result.validationResult.validationError.push(validationError);
  });
  return result;

  function parseSpecificHTMLStringBlocks(rawCode, htmlElementName) {
    if (!htmlElementName || htmlElementName === "body") throw new Error("htmlElementName is empty");
    const parser = new DOMParser();
    const doc = parser.parseFromString(rawCode, "text/html");
    const blocks = doc.getElementsByTagName(htmlElementName) ?? [];
    return Array.from(blocks).map((htmlBlock) => {
      return {
        innerText: htmlBlock.innerText,
        attributes: htmlBlock.attributes,
        parent: htmlBlock.parentNode,
        html: htmlBlock.outerHTML,
        originalCode: rawCode,
      };
    });
  }

  function isValidHTMLNode(codeblock) {
    // this mean the script had tags other than script or style
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
}
