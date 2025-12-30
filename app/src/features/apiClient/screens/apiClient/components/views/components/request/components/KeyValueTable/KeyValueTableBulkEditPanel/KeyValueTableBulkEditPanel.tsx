import React, { useCallback, useState } from "react";
import Editor, { EditorLanguage } from "componentsV2/CodeEditor";
import { KeyValuePair, KeyValueDataType } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./keyValueTableBulkEditPanel.scss";

interface KeyValueTableBulkEditPanelProps {
  data: KeyValuePair[];
  onChange: (updatedPairs: KeyValuePair[]) => void;
  onClose: () => void;
  onDataChanged?: (dataLength: number) => void;
}

const parseKeyValueText = (text: string, originalData: KeyValuePair[]): KeyValuePair[] => {
  const existingDataMap = new Map(originalData.map((item) => [item.key, item]));

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, idx) => {
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
          value: value,
          isEnabled: !isCommented,
        };
      }

      return {
        id: Date.now() + idx,
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
      if (!pair.key) return "";
      return `${pair.key}:${pair.value}`;
    })
    .filter((line) => line.length > 0)
    .join("\n");
};

export const KeyValueTableBulkEditPanel: React.FC<KeyValueTableBulkEditPanelProps> = ({
  data,
  onChange,
  onClose,
  onDataChanged,
}) => {
  const [editorValue, setEditorValue] = useState(() => formatKeyValueText(data));

  const handleEditorChange = useCallback(
    (value: string) => {
      setEditorValue(value);
      const parsed = parseKeyValueText(value, data);
      onChange(parsed);
      onDataChanged?.(parsed.length);
    },
    [onChange, onDataChanged, data]
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
          hideToolbar
          hideCharacterCount
          autoFocus={true}
          autocompletion={false}
        />
        <div className="bulk-edit-panel-hint">Format: key:value | One row per line | Prepend // to disable a row</div>
      </div>
    </div>
  );
};
