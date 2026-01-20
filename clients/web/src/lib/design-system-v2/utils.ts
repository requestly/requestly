export const generateCSSVariables = (tokens: Record<string, string | number>, prefix = "rq-") => {
  return Object.entries({
    ...tokens,
  }).reduce((acc: Record<string, string | number>, [key, value]) => {
    acc[`--${prefix}${key}`] = value;
    return acc;
  }, {});
};
