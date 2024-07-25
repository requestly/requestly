import prettier from "prettier";
// @ts-ignore
import parserBabel from "prettier/parser-babel";
// @ts-ignore
import parserHtml from "prettier/parser-html";
// @ts-ignore
import parserCss from "prettier/parser-postcss";
import { EditorLanguage } from "./types";
import Logger from "lib/logger";

export const getEditorParserConfig = (language: EditorLanguage) => {
  let parser = "babel";
  let parserPlugin = parserBabel;

  switch (language) {
    case EditorLanguage.HTML:
      parser = "html";
      parserPlugin = parserHtml;
      break;
    case EditorLanguage.CSS:
      parser = "css";
      parserPlugin = parserCss;
      break;
    case EditorLanguage.JSON:
      parser = "json";
      break;
    default:
      break;
  }
  return { parser, parserPlugin };
};

export const prettifyCode = (code: string, language: EditorLanguage) => {
  try {
    let prettifiedCode = code;

    if (language === EditorLanguage.JSON) {
      prettifiedCode = JSON.stringify(JSON.parse(code));
    } else {
      const { parser, parserPlugin } = getEditorParserConfig(language);

      prettifiedCode = prettier.format(code, {
        parser: parser,
        plugins: [parserPlugin],
      }) as string;
    }

    return { code: prettifiedCode, success: true, language };
  } catch (error) {
    Logger.log("Error in prettifying code", error);
    return { code: code, success: false, language };
  }
};
