import React, { useState } from "react";
import { RQButton } from "lib/design-system/components";
import { IoMdCopy } from "@react-icons/all-files/io/IoMdCopy";
import { PiBracketsCurlyBold } from "@react-icons/all-files/pi/PiBracketsCurlyBold";
import { BsFiletypeRaw } from "@react-icons/all-files/bs/BsFiletypeRaw";
import { MdOpenInFull } from "@react-icons/all-files/md/MdOpenInFull";
import { MdCloseFullscreen } from "@react-icons/all-files/md/MdCloseFullscreen";
import { EditorLanguage, EditorCustomToolbar } from "componentsV2/CodeEditor/types";
import { Tooltip } from "antd";
import { useTheme } from "styled-components";
import "./toolbar.scss";
import { prettifyCode } from "componentsV2/CodeEditor/utils";
import {
  trackCodeEditorCodePrettified,
  trackCodeEditorCodeMinified,
  trackCodeEditorCodeCopied,
} from "componentsV2/CodeEditor/components/analytics";
import { copyToClipBoard } from "utils/Misc";

interface CodeEditorToolbarProps {
  language: EditorLanguage;
  code: string;
  customOptions?: EditorCustomToolbar;
  onCodeFormat: (formattedCode: string) => void;
  isFullScreen: boolean;
  handleFullScreenToggle: () => void;
  isCodePrettified: boolean;
  enablePrettify?: boolean;
  setIsCodePrettified: (value: boolean) => void;
}

const CodeEditorToolbar: React.FC<CodeEditorToolbarProps> = ({
  language,
  code,
  onCodeFormat,
  customOptions,
  isFullScreen = false,
  handleFullScreenToggle = () => {},
  isCodePrettified,
  setIsCodePrettified,
  enablePrettify,
}) => {
  const theme = useTheme();
  const [isCopied, setIsCopied] = useState(false);

  const handleCodeFormatting = async () => {
    if (language === EditorLanguage.JSON) {
      await handlePrettifyToggle();
    } else {
      await handlePrettifyCode();
    }
  };

  // This function is used for all languages except JSON
  const handlePrettifyCode = async () => {
    const result = await prettifyCode(code, language);

    if (result.success) {
      onCodeFormat(result.code);
      trackCodeEditorCodePrettified();
    }
  };

  // This function is only used for JSON code
  const handlePrettifyToggle = async () => {
    if (isCodePrettified) {
      try {
        const minifiedCode = JSON.stringify(JSON.parse(code));
        onCodeFormat(minifiedCode);
        trackCodeEditorCodeMinified();
        setIsCodePrettified(false);
      } catch (error) {
        // NOOP
      }
    } else {
      await handlePrettifyCode();
      setIsCodePrettified(true);
      trackCodeEditorCodePrettified();
    }
  };

  const handleCopyCode = async () => {
    const result = await copyToClipBoard(code);
    if (result.success) {
      setIsCopied(true);
      trackCodeEditorCodeCopied();
      setTimeout(() => {
        setIsCopied(false);
      }, 1000);
    }
  };

  return (
    <div className="code-editor-toolbar no-drag">
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
        {/* TODO: ADD toggle search button */}
        <Tooltip title={isCopied ? "Copied" : "Copy code"} color={theme.colors.black} mouseEnterDelay={0.6}>
          <RQButton size="small" type="text" icon={<IoMdCopy />} onClick={handleCopyCode} />
        </Tooltip>
        {enablePrettify && (
          <Tooltip
            title={language === EditorLanguage.JSON && isCodePrettified ? "View raw" : "Prettify code"}
            color={theme.colors.black}
            mouseEnterDelay={0.6}
          >
            <RQButton
              size="small"
              type="text"
              icon={isCodePrettified && code?.length > 0 ? <BsFiletypeRaw /> : <PiBracketsCurlyBold />}
              onClick={handleCodeFormatting}
            />
          </Tooltip>
        )}
        <Tooltip
          color={theme.colors.black}
          title={isFullScreen ? "Exit full screen (esc)" : "Full screen"}
          placement="bottomLeft"
        >
          <RQButton
            size="small"
            type="text"
            icon={isFullScreen ? <MdCloseFullscreen /> : <MdOpenInFull />}
            onClick={handleFullScreenToggle}
          />
        </Tooltip>
      </div>
    </div>
  );
};

export default CodeEditorToolbar;
