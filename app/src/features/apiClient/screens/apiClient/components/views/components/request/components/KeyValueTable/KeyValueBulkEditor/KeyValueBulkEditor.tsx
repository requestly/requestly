import React, { useCallback, useState, useEffect } from "react"; // useRef removed
import { EditorView } from "codemirror";
import Editor, { EditorLanguage } from "componentsV2/CodeEditor";
import { KeyValuePair, KeyValueDataType } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./KeyValueBulkEditor.scss";

interface KeyValueBulkEditorProps {
  data: KeyValuePair[];
  onChange: (updatedPairs: KeyValuePair[]) => void;
  onClose: () => void;
}

const whiteTextTheme = EditorView.theme({
  "& .cm-line span": {
    color: "#ffffff",
    fontStyle: "normal",
    fontWeight: "normal",
    textDecoration: "none",
  },
});

const parseKeyValueText = (text: string, originalData: KeyValuePair[]): KeyValuePair[] => {
  const existingDataMap = new Map(originalData.map((item) => [item.key, item]));

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const isCommented = line.startsWith("//");
      const cleanLine = isCommented ? line.slice(2).trim() : line;
      const colonIndex = cleanLine.indexOf(":");
      const hasColon = colonIndex !== -1;

      const key = hasColon ? cleanLine.slice(0, colonIndex).trim() : cleanLine.trim();
      const value = hasColon ? cleanLine.slice(colonIndex + 1).trim() : "";
      const existingItem = existingDataMap.get(key);

      if (existingItem) {
        return {
          ...existingItem,
          id: Date.now() + index,
          value: value,
          isEnabled: !isCommented,
        };
      }
      return {
        id: Date.now() + index,
        key: key,
        value: value,
        isEnabled: !isCommented,
        description: "",
        dataType: KeyValueDataType.STRING,
      };
    });
};

const formatKeyValueText = (pairs: KeyValuePair[]): string => {
  return pairs
    .map((pair) => {
      if (!pair.key && !pair.value) return "";
      const line = `${pair.key}:${pair.value}`;
      return pair.isEnabled ? line : `// ${line}`;
    })
    .filter((line) => line.length > 0)
    .join("\n");
};

export const KeyValueBulkEditor: React.FC<KeyValueBulkEditorProps> = ({ data, onChange, onClose }) => {
  const [editorValue, setEditorValue] = useState(() => formatKeyValueText(data));

  useEffect(() => {
    const incomingDataString = formatKeyValueText(data);
    const currentParsed = parseKeyValueText(editorValue, data);
    const currentEffectiveString = formatKeyValueText(currentParsed);
    if (incomingDataString !== currentEffectiveString) {
      setEditorValue(incomingDataString);
    }
  }, [data, editorValue]);

  const handleEditorChange = useCallback(
    (value: string) => {
      setEditorValue(value);
      const parsed = parseKeyValueText(value, data);
      onChange(parsed);
    },
    [onChange, data]
  );

  return (
    <div className="key-value-bulk-edit-panel">
      <div className="bulk-edit-panel-header">
        <div className="bulk-edit-panel-title">BULK EDIT PARAMS</div>
        <RQButton
          type="transparent"
          size="small"
          icon={<MdClose />}
          onClick={onClose}
          className="bulk-edit-panel-close-btn"
        />
      </div>
      <div className="bulk-edit-panel-content">
        <Editor
          value={editorValue}
          language={EditorLanguage.JAVASCRIPT}
          handleChange={handleEditorChange}
          customTheme={whiteTextTheme}
          hideToolbar
          hideCharacterCount
          autoFocus={true}
          autocompletion={false}
        />
      </div>
      <div className="bulk-edit-panel-hint">Format: key:value | One row per line | Prepend // to disable a row</div>
    </div>
  );
};
