export const minifyCode = (value) => {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (e) {
    return value;
  }
};

export const formatJSONString = async (value, tabSize = 0) => {
  const prettier = await import("prettier");
  const parserBabel = await import("prettier/parser-babel");

  try {
    return JSON.stringify(JSON.parse(value), null, tabSize); //convert string to JSON if in correct JSON format
  } catch (e) {
    try {
      const formattedCode = prettier.format(value, {
        // converts JS object to JSON
        parser: "json",
        plugins: [parserBabel],
      });
      return JSON.stringify(JSON.parse(formattedCode), null, tabSize);
    } catch {
      return value; // value can also be string
    }
  }
};
