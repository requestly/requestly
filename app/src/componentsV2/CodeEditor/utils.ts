import { EditorLanguage } from "./types";
import Logger from "lib/logger";

export const getEditorParserConfig = async (language: EditorLanguage) => {
  let parser = "babel";
  let parserPlugin = await import("prettier/parser-babel");

  switch (language) {
    case EditorLanguage.HTML:
      parser = "html";
      parserPlugin = await import("prettier/parser-html");
      break;
    case EditorLanguage.CSS:
      parser = "css";
      parserPlugin = await import("prettier/parser-postcss");
      break;
    case EditorLanguage.JSON:
      parser = "json";
      break;
    case EditorLanguage.JSON5:
      // Cleanup for JSON5 in a future release required
      // The proper way is to move to an updated prettier version
      // that supports JSONC and substitute JSON5 support for JSONC
      // in the editor
      parser = "json";
      break;
    default:
      break;
  }
  return { parser, parserPlugin };
};

export const prettifyCode = async (code: string, language: EditorLanguage) => {
  try {
    const prettier = await import("prettier");
    const { parser, parserPlugin } = await getEditorParserConfig(language);

    const prettifiedCode = prettier.format(code, {
      parser: parser,
      plugins: parserPlugin,
    }) as string;

    return { code: prettifiedCode, success: true, language };
  } catch (error) {
    Logger.log("Error in prettifying code", error);
    return { code: code, success: false, language };
  }
};
