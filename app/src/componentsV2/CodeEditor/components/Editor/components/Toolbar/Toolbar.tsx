import React, { useState } from "react";
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import parserHtml from "prettier/parser-html";
import parserCss from "prettier/parser-postcss";
import { RQButton } from "lib/design-system/components";
import { IoMdCopy } from "@react-icons/all-files/io/IoMdCopy";
import { PiBracketsCurlyBold } from "@react-icons/all-files/pi/PiBracketsCurlyBold";
import { BsFiletypeRaw } from "@react-icons/all-files/bs/BsFiletypeRaw";
import { EditorLanguage, EditorCustomToolbar } from "componentsV2/CodeEditor/types";
import Logger from "../../../../../../../../common/logger";
import { Tooltip } from "antd";
import { useTheme } from "styled-components";
import "./toolbar.scss";
import {
  trackCodeEditorCodePrettified,
  trackCodeEditorCodeMinified,
  trackCodeEditorCodeCopied,
} from "componentsV2/CodeEditor/components/analytics";

interface CodeEditorToolbarProps {
  language: EditorLanguage;
  code: string;
  customOptions?: EditorCustomToolbar;
  onCodeFormat: (formattedCode: string) => void;
}

const CodeEditorToolbar: React.FC<CodeEditorToolbarProps> = ({ language, code, onCodeFormat, customOptions }) => {
  const theme = useTheme();
  const [isCodePrettified, setIsCodePrettified] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const handleCodeFormatting = () => {
    if (language === EditorLanguage.JSON) {
      handlePrettifyToggle();
    } else {
      handlePrettifyCode();
    }
  };

  const getEditorParserConfig = (language: EditorLanguage) => {
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

  // This function is used for all languages except JSON
  const handlePrettifyCode = () => {
    const { parser, parserPlugin } = getEditorParserConfig(language);
    try {
      let prettifiedCode = prettier.format(code, {
        parser: parser,
        plugins: [parserPlugin],
      });
      onCodeFormat(prettifiedCode);
      trackCodeEditorCodePrettified();
    } catch (error) {
      Logger.log("Error in prettifying code", error);
    }
  };

  // This function is only used for JSON code
  const handlePrettifyToggle = () => {
    if (isCodePrettified) {
      let minifiedCode = JSON.stringify(JSON.parse(code));
      onCodeFormat(minifiedCode);
      trackCodeEditorCodeMinified();
      setIsCodePrettified(false);
    } else {
      handlePrettifyCode();
      setIsCodePrettified(true);
      trackCodeEditorCodePrettified();
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    trackCodeEditorCodeCopied();
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="code-editor-toolbar">
      <div className="code-editor-custom-options-row">
        {customOptions ? (
          <>
            {customOptions.title ? <div className="code-editor-custom-options-title">{customOptions.title}</div> : null}
            {customOptions.options ? (
              <div className="code-editor-custom-options-block">
                {customOptions.options.map((option, index) => (
                  <div key={index} className="code-editor-custom-option">
                    {option}
                  </div>
                ))}
              </div>
            ) : null}
          </>
        ) : null}
      </div>

      <div className="code-editor-actions">
        <Tooltip title={isCopied ? "Copied" : "Copy code"} color={theme.colors.black} mouseEnterDelay={0.6}>
          <RQButton type="text" icon={<IoMdCopy />} onClick={handleCopyCode} />
        </Tooltip>
        <Tooltip
          title={language === EditorLanguage.JSON && isCodePrettified ? "View raw" : "Prettify code"}
          color={theme.colors.black}
          mouseEnterDelay={0.6}
        >
          <RQButton
            type="text"
            icon={isCodePrettified ? <BsFiletypeRaw /> : <PiBracketsCurlyBold />}
            onClick={handleCodeFormatting}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CodeEditorToolbar;
