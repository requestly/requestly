import isEmpty from "is-empty";
import { globalActions } from "store/slices/global/slice";
//UTILS
import { isValidUrl } from "../../../../../../../../../utils/FormattingHelper";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { cloneDeep, inRange } from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import { parseHTMLString, getHTMLNodeName, validateHTMLTag, removeUrlAttribute } from "./insertScriptValidators";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { countCapturingGroups } from "modules/extension/mv3RuleParser/utils";
import { RE2JS } from "re2js";
import { prettifyCode } from "componentsV2/CodeEditor/utils";
import { EditorLanguage } from "componentsV2/CodeEditor";
import { ResponseRule } from "@requestly/shared/types/entities/rules";

/**
 * In case of a few rules, input from the rule editor does not directly map to rule schema.
 * This function is used to transform and validate the input fields before saving the rule.
 *
 * Returns the transformed rule data if modified, else returns the original rule data.
 * @param {*} ruleData
 * @returns {Promise<{
 *  success: boolean,
 *  ruleData?: object,
 *  validationError?: {
 *    error: string,
 *    message: string,
 *    pairId: string // pair that cause the error
 *  }
 * }>}
 */
export const transformAndValidateRuleFields = (rule) => {
  const ruleData = { ...rule };

  if (ruleData.isSample) {
    delete ruleData.isReadOnly;
    delete ruleData.sampleId;
    delete ruleData.isSample;
  }

  switch (ruleData.ruleType) {
    case GLOBAL_CONSTANTS.RULE_TYPES.SCRIPT: {
      if (!isFeatureCompatible(FEATURES.SCRIPT_RULE.ATTRIBUTES_SUPPORT)) {
        return { success: true, ruleData };
      }
      /* RuleData is explicitly read-only (reference to value in store) */
      const newRuleData = cloneDeep(ruleData);

      const validateScriptRule = () => {
        const promises = [];
        ruleData.pairs.forEach((pair, pairIndex) => {
          pair.scripts.forEach((script, scriptIndex) => {
            promises.push(validateScript(script, scriptIndex, pairIndex));
          });
        });
        return Promise.all(promises)
          .then(() => {
            return { success: true, ruleData: newRuleData };
          })
          .catch((validationError) => {
            /* validation failed */
            return { success: false, validationError };
          });
      };

      const getIndentedCode = (code) => {
        if (!code || typeof code !== "string") return "";
        code.trim();
        // indenting the code without adding unnecessary tabs and new lines
        const newCode = code
          .replace(/^\n+|\n+$/g, "")
          .split("\n")
          .map((line) => (line.startsWith("\t") ? line : `\t${line}`))
          .join("\n");

        return newCode;
      };

      const validateScript = (script, scriptIndex, pairIndex) => {
        // eslint-disable-next-line no-async-promise-executor
        return new Promise(async (resolve, reject) => {
          const codeHTMLTagName = getHTMLNodeName(script.type, script.codeType);

          if (script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE) {
            const res = await validateHTMLTag(script.value, codeHTMLTagName);
            if (!res.isValid) {
              reject({
                error: res.validationError,
                message: res.errorMessage,
                pairId: ruleData.pairs[pairIndex].id,
                id: script.id,
              });
            }
            const { attributes, innerText: code } = parseHTMLString(script.value, codeHTMLTagName);

            newRuleData.pairs[pairIndex].scripts[scriptIndex] = {
              ...script,
              attributes,
              value: getIndentedCode(code),
            };
          } else if (script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
            const res = await validateHTMLTag(script.wrapperElement, codeHTMLTagName);
            if (!res.isValid) {
              reject({
                error: res.validationError,
                message: res.errorMessage,
                pairId: ruleData.pairs[pairIndex].id,
                id: script.id,
              });
            }
            const { attributes: _attr } = parseHTMLString(script.wrapperElement, codeHTMLTagName);

            const attributes = removeUrlAttribute(_attr, script.codeType);

            newRuleData.pairs[pairIndex].scripts[scriptIndex] = {
              ...script,
              attributes,
            };
          }
          delete newRuleData.pairs[pairIndex].scripts[scriptIndex]["wrapperElement"]; // this was used to temporarily store the raw code
          resolve();
        });
      };

      return validateScriptRule();
    }
    default:
      return { success: true, ruleData };
  }
};

export const validateRule = (rule, dispatch, appMode) => {
  let output;
  if (isEmpty(rule.name)) {
    dispatch(
      globalActions.updateCurrentlySelectedRuleErrors({
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

      if (pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES) {
        const hasCapturingGroup = !!countCapturingGroups(pair.source.value);

        if (hasCapturingGroup) {
          output = {
            result: false,
            message: `Capturing groups are not supported in the source regex`,
            error: "capturing group present in source of replace rule",
          };
        }
      }
    });
  }

  //Headers Rule
  else if (rule.ruleType === GLOBAL_CONSTANTS.RULE_TYPES.HEADERS) {
    if (rule.version > 1) {
      rule.pairs.every((pair, index) => {
        if (!pair.modifications) {
          output = {
            result: false,
            message: `Please add atleast one header modification to the rule.`,
            error: "missing modifications key in pair",
          };
          return false;
        }

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

        const headerNameRegex = /^[a-zA-Z0-9-_]+$/;
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

          if (modification.header && !headerNameRegex.test(modification.header)) {
            output = {
              result: false,
              message: `Invalid request header: ${modification.header}. It can only contain alphanumeric characters, hyphens, and underscores.`,
              error: `invalid request header name ${modification.header}`,
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

          if (modification.header && !headerNameRegex.test(modification.header)) {
            output = {
              result: false,
              message: `Invalid response header: ${modification.header}. It can only contain alphanumeric characters, hyphens, and underscores.`,
              error: `invalid response header name ${modification.header}`,
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
          if (script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE) {
            //Check if code isn't empty
            if (isEmpty(script.value)) {
              output = {
                result: false,
                message: `Please enter a valid script code`,
                error: "invalid script code",
              };
            }
            /* NOT APPLYING LOGICAL VALIDATIONS FOR NOW */
            // else {
            //   const res = checkForLogicalErrorsInCode(script.value, script);
            //   if (!res.isValid) {
            //     if (res.error === scriptLogicalErrors.CONTAINS_HTML_CODE) {
            //       output = {
            //         result: false,
            //         message: `Please remove unnecessary HTML tags from the code`,
            //         error: "invalid script code",
            //       };
            //     }
            //     else if (res.error === scriptLogicalErrors.DOM_LOAD_EVENT_LISTENER_AFTER_PAGE_LOAD) {
            //       // dispatch(
            //       //   actions.updateRulePairAtGivenPath({
            //       //     pairIndex,
            //       //     triggerUnsavedChangesIndication: true,
            //       //     updates: {
            //       //       [`scripts[${scriptIndex}].loadTime`]: GLOBAL_CONSTANTS.SCRIPT_LOAD_TIME.BEFORE_PAGE_LOAD,
            //       //     },
            //       //   })
            //       // );

            //       // just show a toast!!!

            //       output = {
            //         result: false,
            //         message: `Updated script load time to before page load`,
            //         error: "invalid script code",
            //         editorToast: {
            //           message: `Contains a DomContentLoaded listener being injected after page load`,
            //           id: pair.id,
            //           type: "info",
            //           onlyInEditor: false,
            //         },
            //         ruleUpdated: true,
            //       };
            //     }
            //   }
            // }
          }
          //Check if URL isn't empty. Can be absolute or relative
          else if (script.type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
            if (isEmpty(script.value) || !isValidUrl(script.value)) {
              output = {
                result: false,
                message: `Please enter a valid script URL`,
                error: "invalid script url",
              };
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
        pair.response?.resourceType === ResponseRule.ResourceType.GRAPHQL_API &&
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
      // Response body shouldn't have invalid syntax
      else if (pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE) {
        const language =
          pair.response.type === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE
            ? EditorLanguage.JAVASCRIPT
            : EditorLanguage.JSON;

        //const result = prettifyCode(pair.response.value, language);
        prettifyCode(pair.response.value, language).then((result) => {
          if (!result.success) {
            output = {
              result: false,
              message: "Response body contains invalid syntax!",
              error: "invalid syntax",
            };
          }
        });
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
      // Request body shouldn't have invalid syntax
      else if (pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE) {
        const language =
          pair.request.type === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE
            ? EditorLanguage.JAVASCRIPT
            : EditorLanguage.JSON;

        //const result = prettifyCode(pair.request.value, language);
        prettifyCode(pair.request.value, language).then((result) => {
          if (!result.success) {
            output = {
              result: false,
              message: "Request body contains invalid syntax!",
              error: "invalid syntax",
            };
          }
        });
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

    for (const pair of rule.pairs) {
      if (pair.source.operator === GLOBAL_CONSTANTS.RULE_OPERATORS.MATCHES && !isRE2Compatible(pair.source.value)) {
        const unsupportedFeatureMessage = checkUnsupportedRE2Features(pair.source.value);

        return {
          result: false,
          message: "Invalid regex. " + unsupportedFeatureMessage,
          error: "not re2 compatible",
        };
      }
    }
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

const checkUnsupportedRE2Features = (regexString) => {
  const unsupportedFeaturesRegex = {
    positive_lookahead: /\(\?=/,
    negative_lookahead: /\(\?!/,
    positive_lookbehind: /\(\?<=/,
    negative_lookbehind: /\(\?<!/,
    backreferences: /\\\d+/,
    named_capture_groups: /\(\?<\w+>/,
  };

  const unsupportedFeaturesMessages = {
    positive_lookahead: "The positive lookahead assertion (?=...) is not supported.",
    negative_lookahead: "The negative lookahead assertion (?!...) is not supported.",
    positive_lookbehind: "The positive lookbehind assertion (?<=...) is not supported.",
    negative_lookbehind: "The negative lookbehind assertion (?<!...) is not supported.",
    backreferences: "Backreferences such as \\1 are not supported.",
    named_capture_groups: "Named capture groups such as (?<name>...) are not supported.",
  };

  let message = "Only RE2 regex syntax is supported.";

  for (const [feature, regex] of Object.entries(unsupportedFeaturesRegex)) {
    if (regexString.match(regex)) {
      message = unsupportedFeaturesMessages[feature];
      break;
    }
  }

  return message;
};

const isRE2Compatible = (regexString) => {
  try {
    RE2JS.compile(regexString);
    return true;
  } catch (error) {
    return false;
  }
};
