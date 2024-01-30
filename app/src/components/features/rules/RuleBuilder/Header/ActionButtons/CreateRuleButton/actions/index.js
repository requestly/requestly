import isEmpty from "is-empty";
import { actions } from "../../../../../../../../store";
//UTILS
import { isValidUrl } from "../../../../../../../../utils/FormattingHelper";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { inRange } from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import { ResponseRuleResourceType } from "types/rules";

import { isFeatureCompatible } from "utils/CompatibilityUtils";

import FEATURES from "config/constants/sub/features";
import { invalidHTMLError, parseHTMLTagInCodeString, postProcessCode } from "./insertScriptValidators";

export const validateRule = (rule, dispatch, appMode) => {
  let output;
  if (isEmpty(rule.name)) {
    dispatch(
      actions.updateCurrentlySelectedRuleErrors({
        name: "Rule name is required",
      })
    );
    return {
      result: false,
      message: `Please provide a rule name`,
      error: "missing rule name",
    };
  } else if (isEmpty(rule.pairs)) {
    return {
      result: false,
      message: `Opps! Rule must have atleast one pair`,
      error: "missing rule pair",
    };
  }

  //Rule specific validations

  //Redirect Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REDIRECT) {
    rule.pairs.forEach((pair) => {
      //Source shouldn't be empty
      if (isEmpty(pair.source.value)) {
        output = {
          result: false,
          message: `Please enter a source`,
          error: "missing source",
        };
      }
      //Destination shouldn't be empty
      else if (isEmpty(pair.destination)) {
        output = {
          result: false,
          message: `Please enter a destination URL`,
          error: "missing destination",
        };
      }
      //Destination should be a valid URL
      else if (!isValidUrl(pair.destination) && !pair.destination.startsWith("$")) {
        output = {
          result: false,
          message: `Please enter a valid redirect URL`,
          error: "not valid url",
        };
      }
    });
  }

  //Cancel Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.CANCEL) {
    rule.pairs.forEach((pair) => {
      //Source shouldn't be empty
      if (isEmpty(pair.source.value)) {
        output = {
          result: false,
          message: `Please enter a source`,
          error: "missing source",
        };
      }
    });
  }

  //Replace Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REPLACE) {
    rule.pairs.forEach((pair) => {
      //Part that need to be replaced shouldn't be empty
      if (isEmpty(pair.from)) {
        output = {
          result: false,
          message: `Please enter the part that needs to be replaced`,
          error: "missing from field",
        };
      }
    });
  }

  //Headers Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.HEADERS) {
    if (rule.version > 1) {
      rule.pairs.every((pair, index) => {
        if (pair.modifications.Request?.length === 0 && pair.modifications.Response?.length === 0) {
          output = {
            result: false,
            message:
              index > 0
                ? `One of the rule conditions is empty. Please add some header modification to the condition.`
                : `Please add atleast one modification to the rule.`,
            error: "missing modification",
          };
        }

        // Iterate over request headers
        pair.modifications.Request?.forEach((modification) => {
          //Header name shouldn't be empty
          if (isEmpty(modification.header)) {
            output = {
              result: false,
              message: `Please enter the request header name`,
              error: "missing request header name",
            };
          }
          //Header value shouldn't be empty unless you're removing it
          if (modification.type !== "Remove" && isEmpty(modification.value)) {
            output = {
              result: false,
              message: `Please enter the request header value`,
              error: "missing request header value",
            };
          }
        });

        // Iterate over response headers
        pair.modifications.Response?.forEach((modification) => {
          //Header name shouldn't be empty
          if (isEmpty(modification.header)) {
            output = {
              result: false,
              message: `Please enter the response header name`,
              error: "missing response header name",
            };
          }
          //Header value shouldn't be empty unless you're removing it
          if (modification.type !== "Remove" && isEmpty(modification.value)) {
            output = {
              result: false,
              message: `Please enter the response header value`,
              error: "missing request header value",
            };
          }
        });

        if (output?.result === false) {
          return false;
        } else {
          return true;
        }
      });
    } else {
      rule.pairs.forEach((pair) => {
        //Header name shouldn't be empty
        if (isEmpty(pair.header)) {
          output = {
            result: false,
            message: `Please enter the header name`,
            error: "missing header name",
          };
        }
        //Header value shouldn't be empty unless you're removing it
        if (pair.type !== "Remove" && isEmpty(pair.value)) {
          output = {
            result: false,
            message: `Please enter the header value`,
            error: "missing header value",
          };
        }
      });
    }
  }

  //Query Param Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.QUERYPARAM) {
    rule.pairs.forEach((pair) => {
      pair.modifications.forEach((modification) => {
        //Param name shoudn't be empty unless user is removing all params
        if (modification.type !== "Remove All" && isEmpty(modification.param)) {
          output = {
            result: false,
            message: `Please enter the param name`,
            error: "missing param name",
          };
        }
        //Param value shouln't be empty if user is adding it
        if (modification.type === "Add" && isEmpty(modification.value)) {
          output = {
            result: false,
            message: `Please enter the param value`,
            error: "missing param value",
          };
        }
      });
    });
  }
  //Insert Script Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT) {
    const isAppCompatibleForRawHTMLTagsInScriptRule = isFeatureCompatible(FEATURES.SCRIPT_RULE_HTML_BLOCK);

    rule.pairs.forEach((pair) => {
      //There should be atleast one source of script. Be it given library or a custom script
      if (isEmpty(pair.libraries) && isEmpty(pair.scripts)) {
        output = {
          result: false,
          message: `Please provide a script source`,
          error: "missing script source",
        };
      } else {
        pair.scripts.forEach((script) => {
          if (script.type === "code") {
            //Check if code isn't empty
            if (isEmpty(script.value)) {
              output = {
                result: false,
                message: `Please enter a valid script code`,
                error: "invalid script code",
              };
            }

            const htmlNodeName = script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? "script" : "style"; // todo: clean
            const result = parseHTMLTagInCodeString(script.value, htmlNodeName);

            // Check if code has raw html tags, but current app version does not support it
            if (!isAppCompatibleForRawHTMLTagsInScriptRule && result.parsedCodeBlocks.length > 0) {
              output = {
                result: false,
                message: `Please upgrade the extension to use raw ${htmlNodeName} tags inside code`,
                error: "invalid script code",
              };
            }
            // if code contains raw incorrect html tags
            else if (!result.validationResult.isValid) {
              const validationError = result.validationResult.validationError[0];
              // todo: show these errors in code editor!
              // contains tags that are unsupported for current type of rule
              if (validationError === invalidHTMLError.UNSUPPORTED_TAGS) {
                output = {
                  result: false,
                  message: `Only ${htmlNodeName} tags are supported`,
                  error: "invalid script code",
                };
              }
              // incorrectly structured html tags (mostly happens because of missing closing tag)
              else if (validationError === invalidHTMLError.UNCLOSED_TAGS) {
                output = {
                  result: false,
                  message: `Please ensure all ${htmlNodeName} tags are closed properly`,
                  error: "invalid script code",
                };
              }
            }

            const rawCode = result.parsedCodeBlocks.length ? result.innerCode : script.value;
            postProcessCode(rawCode, script);
          }
          //Check if URL isn't empty. Can be absolute or relative
          else if (script.type === "url") {
            if (isEmpty(script.value)) {
              output = {
                result: false,
                message: `Please enter a valid script URL`,
                error: "invalid script url",
              };
            } else if (script.wrapperElement) {
              const htmlNodeName = script.codeType === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS ? "script" : "link"; // todo: clean

              if (!isAppCompatibleForRawHTMLTagsInScriptRule) {
                // in this case we can still process the code but we'll show a tooltip in the editor // todo: remove comment
                output = {
                  result: false,
                  message: `Please upgrade the extension to use raw ${htmlNodeName} tags inside code`,
                  error: "invalid script code",
                };
              } else {
                const result = parseHTMLTagInCodeString(script.wrapperElement, htmlNodeName);
                if (!result.validationResult.isValid) {
                  const validationError = result.validationResult.validationError[0];
                  if (validationError === invalidHTMLError.UNSUPPORTED_TAGS) {
                    output = {
                      result: false,
                      message: `Only ${htmlNodeName} tags are supported`,
                      error: "invalid script code",
                    };
                  } else if (validationError === invalidHTMLError.UNCLOSED_TAGS) {
                    output = {
                      result: false,
                      message: `Please ensure all ${htmlNodeName} tags are closed properly`,
                      error: "invalid script code",
                    };
                  }
                }
              }
            }
          }
        });
      }
    });
  }

  //Modify Response Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE) {
    rule.pairs.forEach((pair) => {
      // should have resource type
      if (isEmpty(pair.response.resourceType)) {
        output = {
          result: false,
          message: "Please select a resource type to continue",
          error: "missing resource type",
        };
      }
      //Source shouldn't be empty
      else if (isEmpty(pair.source.value)) {
        output = {
          result: false,
          message: `Please enter a source`,
          error: "missing source",
        };
      }
      // graphql operation data shouldn't be empty
      else if (
        pair.response?.resourceType === ResponseRuleResourceType.GRAPHQL_API &&
        !isEmpty(pair.source?.filters?.[0]?.requestPayload) &&
        (!pair.source.filters[0].requestPayload.key || !pair.source.filters[0].requestPayload.value)
      ) {
        output = {
          result: false,
          message: `Please enter both key and value for GraphQL operation`,
          error: "incomplete source filter",
        };
      }
      //file selection shouldn't be empty
      else if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.LOCAL_FILE && isEmpty(pair.response.value)) {
        output = {
          result: false,
          message: "Please select a file first",
          error: "file not selected",
        };
      }
    });
  }

  //Modify Request Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.REQUEST) {
    rule.pairs.forEach((pair) => {
      //Source shouldn't be empty
      if (isEmpty(pair.source.value)) {
        output = {
          result: false,
          message: `Please enter a source`,
          error: "missing source",
        };
      }
      //Request body shouldn't be empty
      else if (isEmpty(pair.request.value)) {
        let message = `Please specify request body`;
        output = {
          result: false,
          message: message,
          error: "missing request body",
        };
      }
    });
  }

  //User Agent Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.USERAGENT) {
    rule.pairs.forEach((pair) => {
      if (isEmpty(pair.envType)) {
        output = {
          result: false,
          message: "Please select device type",
          error: "missing device type",
        };
      } else if (isEmpty(pair.env) && !pair.userAgent) {
        output = {
          result: false,
          message: "Please select UserAgent",
          error: "missing useragent",
        };
      }
    });
  }

  //Delay Request Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.DELAY) {
    rule.pairs.forEach((pair) => {
      const { delay } = pair;
      //URL shouldn't be empty
      if (isEmpty(pair.source.value)) {
        output = {
          result: false,
          message: `Please enter a source`,
          error: "missing source",
        };
      }
      // Delay shouldn't be empty
      else if (isEmpty(delay)) {
        output = {
          result: false,
          message: `Delay cannot be empty`,
          error: "missing delay field",
        };
      }
      // Delay should be a number
      else if (isNaN(delay) && parseInt(delay) !== 0) {
        output = {
          result: false,
          message: `Delay should be a Number`,
          error: "delay is not number",
        };
      }
      // Delay between 1 & 5000
      else if (
        parseInt(delay) === 0 ||
        (appMode !== GLOBAL_CONSTANTS.APP_MODES.DESKTOP &&
          !inRange(
            parseInt(delay),
            GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MIN_DELAY_VALUE,
            GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_NON_XHR + 1
          ))
      ) {
        output = {
          result: false,
          message: `Delay should lie between ${GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MIN_DELAY_VALUE} and ${GLOBAL_CONSTANTS.DELAY_REQUEST_CONSTANTS.MAX_DELAY_VALUE_NON_XHR}`,
          error: "delay not in range",
        };
      }
    });
  }

  if (!output) {
    // regex validation
    rule.pairs.every((pair) => {
      if (pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES) {
        const pattern = pair.source.value.replace(/\/(.*)\//, "$1");
        try {
          new RegExp(pattern);
        } catch (err) {
          output = {
            result: false,
            message: err.message,
            error: "invalid regex",
          };
          return false;
        }
      }
      return true;
    });
  }

  if (output && output.result === false) {
    return output;
  }

  return {
    result: true,
  };
};

export const ruleModifiedAnalytics = (user) => {
  if (user.loggedIn) {
    const functions = getFunctions();
    const usageMetrics = httpsCallable(functions, "usageMetrics");
    const data = new Date().getTime();
    usageMetrics(data);
  }
};
