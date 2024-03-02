// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";

/* TYPES */
type ScriptLanguage = GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS | GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS;
type ScriptType = GLOBAL_CONSTANTS.SCRIPT_TYPES.URL | GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE;
type ScriptAttributes = {
  name: string;
  value: string;
}[];

/* UTILS */
const createAttributesString = (attributes: ScriptAttributes = []) => {
  const attributesString =
    attributes
      ?.map(({ name: attrName, value: attrVal }) => {
        if (!attrVal) return `${attrName}`;
        return `${attrName}="${attrVal}"`;
      })
      .join(" ") ?? "";
  attributesString.trim();
  return attributesString;
};

/* DEFAULTS */
function getInfoMessageAsComment(language: ScriptLanguage) {
  if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS)
    return "\n  // Custom attributes to the script can be added here.\n  // Everything else will be ignored.\n";
  if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS)
    return "\n<!--\n  Custom attributes to the script can be added here.\n  Everything else will be ignored \n-->\n";

  return null;
}
function getPlaceHolderCode(language: ScriptLanguage, isCompatibleWithAttributes: boolean) {
  switch (language) {
    case GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS:
      return isCompatibleWithAttributes
        ? '<script type="text/javascript">\n\tconsole.log("Hello World");\n</script>'
        : 'console.log("Hello World");';
    case GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS:
      return isCompatibleWithAttributes
        ? "<style>\n\tbody {\n\t\t background-color: #fff;\n\t}\n</style>"
        : "body {\n\t background-color: #fff;\n }";
  }

  return "";
}

/* MAIN */

// ScriptType === GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE
function createRenderedTextForCode(code: string, attributes: ScriptAttributes, language: ScriptLanguage) {
  if (!code && !attributes.length) return getPlaceHolderCode(language, true);

  const attributesString = createAttributesString(attributes);
  if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
    return `<script ${attributesString ? `${attributesString}` : `type="text/javascript"`}>\n${code}\n</script>`;
  }
  if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS) {
    return `<style ${attributesString ? `${attributesString}` : `type="text/css"`}>\n${code}\n</style>`;
  }
}

// ScriptType === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL
function getRenderedTextForURLType(attributes: ScriptAttributes, language: ScriptLanguage) {
  const attributesString = createAttributesString(attributes);
  if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.JS) {
    return `<script src={{scriptURL}} ${
      attributesString ? ` ${attributesString}` : `type="text/javascript"`
    }>${getInfoMessageAsComment(language)}</script>`;
  }
  if (language === GLOBAL_CONSTANTS.SCRIPT_CODE_TYPES.CSS) {
    return `<link href={{scriptURL}} ${
      attributesString ? ` ${attributesString}` : `rel="stylesheet" type="text/css"`
    }>${getInfoMessageAsComment(language)}`;
  }
}

// Assumes isCompatibleWithAttributes === true
export function createRenderedScript(
  code: string,
  attrs: ScriptAttributes,
  type: ScriptType,
  language: ScriptLanguage
) {
  if (type === GLOBAL_CONSTANTS.SCRIPT_TYPES.URL) {
    return getRenderedTextForURLType(attrs, language);
  }
  if (type === GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE) {
    return createRenderedTextForCode(code, attrs, language);
  }
}

export function getDefaultScriptRender(
  language: ScriptLanguage,
  scriptType: ScriptType,
  isCompatibleWithAttributes: boolean
) {
  switch (scriptType) {
    case GLOBAL_CONSTANTS.SCRIPT_TYPES.URL:
      return getRenderedTextForURLType([], language);
    case GLOBAL_CONSTANTS.SCRIPT_TYPES.CODE:
      return getPlaceHolderCode(language, isCompatibleWithAttributes);
    default:
      return "";
  }
}
