window.RQ = window.RQ || {};

RQ.PreDefinedFunction = function (name, descriptors) {
  this.name = name;

  // Bind all descriptor fields to this object like argument, pattern etc.
  for (var key in descriptors) {
    this[key] = descriptors[key];
  }

  var argumentPattern;
  if (this.argument.constructor === Array && this.argument.length > 0) {
    // multiple arguments
    argumentPattern = this.argument[0];
    for (var index = 1; index < this.argument.length; index++) {
      argumentPattern += "(" + RQ.PreDefinedFunction.patterns.COMMA + this.argument[index] + ")?";
    }
  } else {
    argumentPattern = this.argument;
  }
  this.pattern = this.pattern || new RegExp(this.name + "\\(" + argumentPattern + "\\)", "ig");
};

RQ.PreDefinedFunction.patterns = {
  STRING: "((?!rq_).)+", // matches any string not having rq_ (probably another predefined function)
  NUMBER: "[0-9]+",
  COMMA: " *, *",
};

RQ.PreDefinedFunction.prototype = {
  argument: RQ.PreDefinedFunction.patterns.STRING,

  eval: function (value) {
    var that = this;

    if (typeof this.argumentEvaluator !== "function") {
      return value;
    }

    return value.replace(this.pattern, function (token) {
      var matches = token.match(new RegExp(that.name + "\\((.*)\\)", "i")), // extract argument from rq_func(argument)
        args = [];

      if (matches != null && matches.length > 1) {
        matches[1].split(",").forEach(function (arg) {
          args.push(arg.trim());
        });
        return that.argumentEvaluator.apply(that, args);
      }

      return token;
    });
  },
};
