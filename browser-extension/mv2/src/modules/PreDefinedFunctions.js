window.RQ = window.RQ || {};

RQ.PreDefinedFunctions = {};

/**
 * @param name Name of predefined function, mandatory to start with 'rq_'.
 * @param descriptors Set of properties which define this function. Eg: description, usage, argument
 */
RQ.registerPredefinedFunction = function (name, descriptors) {
  RQ.PreDefinedFunctions[name] = new RQ.PreDefinedFunction(name, descriptors);
};

RQ.registerPredefinedFunction("rq_rand", {
  description: "Generate Random Number",

  usage: "rq_rand(4) (Max 8 digits allowed)",

  argument: RQ.PreDefinedFunction.patterns.NUMBER, // rq_rand(argument)

  getRandomNumber: function (numDigits) {
    return Math.ceil(Math.random() * Math.pow(10, numDigits));
  },

  argumentEvaluator: function (arg) {
    var numDigits = Math.min(arg, 8),
      valueToFit = this.getRandomNumber(numDigits);

    // Catch: For <rq_rand(4)>, we may get 3 digit value because leading zeros are omitted from numbers
    valueToFit = valueToFit.toString();
    while (valueToFit.length < numDigits) {
      valueToFit = valueToFit + "0";
    }

    return valueToFit;
  },
});

RQ.registerPredefinedFunction("rq_encode", {
  description: "Encode part of URL",

  usage: "rq_encode(user+test@example.com)",

  argument: RQ.PreDefinedFunction.patterns.STRING,

  argumentEvaluator: encodeURIComponent,
});

RQ.registerPredefinedFunction("rq_decode", {
  description: "Encode part of URL",

  usage: "rq_decode(user%2Btest%40example.com)",

  argument: RQ.PreDefinedFunction.patterns.STRING,

  argumentEvaluator: decodeURIComponent,
});

RQ.registerPredefinedFunction("rq_increment", {
  description: "Increment a number optionally by a step",

  usage: "rq_increment(3,5)",

  argument: [
    RQ.PreDefinedFunction.patterns.NUMBER,
    RQ.PreDefinedFunction.patterns.NUMBER,
  ],

  argumentEvaluator: function (num, step) {
    step = step || 1;
    return parseInt(num) + parseInt(step);
  },
});

RQ.registerPredefinedFunction("rq_decrement", {
  description: "Decrement a number optionally by a step",

  usage: "rq_increment(5,2)",

  argument: [
    RQ.PreDefinedFunction.patterns.NUMBER,
    RQ.PreDefinedFunction.patterns.NUMBER,
  ],

  argumentEvaluator: function (num, step) {
    step = step || 1;
    return parseInt(num) - parseInt(step);
  },
});
