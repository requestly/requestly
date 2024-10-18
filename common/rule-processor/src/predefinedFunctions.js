// PRE-DEFINED FUNCTIONS ARE CURRENTLY USED IN HEADERS RULE ONLY!

import * as CONSTANTS from "../../constants";

const { RULE_TYPES } = CONSTANTS;

export const PREDEFINED_FUNCTIONS = {};
export const PATTERNS = {
  STRING: "((?!rq_).)+", // matches any string not having rq_ (probably another predefined function)
  NUMBER: "[0-9]+",
  COMMA: " *, *",
  EMPTY_STRING: "",
};

// Generate Random Number
PREDEFINED_FUNCTIONS.GENERATE_RANDOM_NUMBER = {
  applicableRuleTypes: [RULE_TYPES?.HEADERS],
  name: "rq_rand", // Name of predefined function, mandatory to start with 'rq_'.
  description: "Generate Random Number",
  usage: "rq_rand(4) (Max 8 digits allowed)",
  argument: PATTERNS.NUMBER, // rq_rand(argument)
  getRandomNumber: function (numDigits) {
    return Math.ceil(Math.random() * Math.pow(10, numDigits));
  },
  argumentEvaluator: function ([args], payload = {}) {
    const arg = args[0];
    var numDigits = Math.min(arg, 8),
      valueToFit = PREDEFINED_FUNCTIONS.GENERATE_RANDOM_NUMBER.getRandomNumber(numDigits);

    // Catch: For <rq_rand(4)>, we may get 3 digit value because leading zeros are omitted from numbers
    valueToFit = valueToFit.toString();
    while (valueToFit.length < numDigits) {
      valueToFit = valueToFit + "0";
    }

    return valueToFit;
  },
};

// Get Request Origin
PREDEFINED_FUNCTIONS.GET_REQUEST_ORIGIN = {
  applicableRuleTypes: [RULE_TYPES?.HEADERS],
  name: "rq_request_initiator_origin", // Name of predefined function, mandatory to start with 'rq_'.
  description: "The origin request header",
  usage: "rq_request_initiator_origin()",
  argument: PATTERNS.EMPTY_STRING,
  argumentEvaluator: function ([args], payload = {}) {
    if (payload && payload["requestOrigin"]) return payload["requestOrigin"];
    return "*";
  },
};
