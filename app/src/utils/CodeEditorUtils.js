import prettier from "prettier";
import parserBabel from "prettier/parser-babel";

export const minifyCode = (value) => {
  try {
    return JSON.stringify(JSON.parse(value));
  } catch (e) {
    return value;
  }
};

export const processStaticDataBeforeSave = (value) => {
  try {
    return JSON.stringify(JSON.parse(value)); //convert string to JSON if in correct JSON format
  } catch (e) {
    try {
      const formattedCode = prettier.format(value, {
        // converts JS object to JSON
        parser: "json",
        plugins: [parserBabel],
      });
      return JSON.stringify(JSON.parse(formattedCode));
    } catch {
      return value; // value can also be string
    }
  }
};
