import React, { useState } from "react";
import prettier from "prettier";
import parserBabel from "prettier/parser-babel";
import { RQButton } from "lib/design-system/components";
import { IoMdCopy } from "@react-icons/all-files/io/IoMdCopy";
import { PiBracketsCurlyBold } from "@react-icons/all-files/pi/PiBracketsCurlyBold";
import { BsFiletypeRaw } from "@react-icons/all-files/bs/BsFiletypeRaw";
import { EditorLanguage } from "componentsV2/CodeEditor/types";
import Logger from "../../../../../../../../common/logger";
import { Tooltip } from "antd";
import { useTheme } from "styled-components";
import "./toolbar.scss";

interface CodeEditorToolbarProps {
  language: EditorLanguage;
  code: string;
  onCodeFormat: (formattedCode: string) => void;
}

const CodeEditorToolbar: React.FC<CodeEditorToolbarProps> = ({ language, code, onCodeFormat }) => {
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

  // This function is used for all languages except JSON
  const handlePrettifyCode = (parser = "babel") => {
    try {
      let prettifiedCode = prettier.format(code, {
        parser: parser,
        plugins: [parserBabel],
      });
      onCodeFormat(prettifiedCode);
    } catch (error) {
      Logger.log("Error in prettifying code", error);
    }
  };

  // This function is only used for JSON code
  const handlePrettifyToggle = () => {
    if (isCodePrettified) {
      let minifiedCode = JSON.stringify(JSON.parse(code));
      onCodeFormat(minifiedCode);
      setIsCodePrettified(false);
    } else {
      handlePrettifyCode(EditorLanguage.JSON);
      setIsCodePrettified(true);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setIsCopied(true);
    setTimeout(() => {
      setIsCopied(false);
    }, 1000);
  };

  return (
    <div className="code-editor-toolbar">
      <div>CUSTOM TOOL BAR HERE</div>
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
