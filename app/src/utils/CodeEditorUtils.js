import prettier from "prettier";
import parserBabel from "prettier/parser-babel";

export const minifyCode = (value) => {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (e) {
    return value;
  }
};

export const formatJSONString = (value, tabSize = 0) => {
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
