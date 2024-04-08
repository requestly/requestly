export const generateCSSVariables = (tokens: Record<string, string>, prefix = "rq-") => {
  return Object.entries({
    ...tokens,
  }).reduce((acc: Record<string, string>, [key, value]) => {
    acc[`--${prefix}${key}`] = value;
    return acc;
  }, {});
};
