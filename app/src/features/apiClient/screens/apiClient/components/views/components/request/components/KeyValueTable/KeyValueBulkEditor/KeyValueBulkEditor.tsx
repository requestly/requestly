import React, { useCallback, useState, useEffect, useRef } from "react";
import { EditorView } from "codemirror";
import { EditorSelection, Transaction } from "@codemirror/state";
import Editor, { EditorLanguage } from "componentsV2/CodeEditor";
import { KeyValuePair, KeyValueDataType } from "features/apiClient/types";
import { RQButton } from "lib/design-system-v2/components";
import { MdClose } from "@react-icons/all-files/md/MdClose";
import "./KeyValueBulkEditor.scss";

type StoreHook = (selector: (state: any) => any) => any;

interface KeyValueBulkEditorProps {
  data: KeyValuePair[];
  onChange: (updatedPairs: KeyValuePair[]) => void;
  onClose: () => void;
  useStore?: StoreHook;
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
  const existingDataMap = new Map<string, KeyValuePair[]>();
  originalData.forEach((item) => {
    if (!existingDataMap.has(item.key)) {
      existingDataMap.set(item.key, []);
    }
    existingDataMap.get(item.key)!.push(item);
  });

  let idCounter = 0;
  const generateId = () => Date.now() * 1000 + idCounter++;

  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const isCommented = line.startsWith("//");
      const cleanLine = isCommented ? line.slice(2).trim() : line;
      const colonIndex = cleanLine.indexOf(":");
      const hasColon = colonIndex !== -1;

      const key = hasColon ? cleanLine.slice(0, colonIndex).trim() : cleanLine.trim();
      const value = hasColon ? cleanLine.slice(colonIndex + 1).trim() : "";
      const existingItems = existingDataMap.get(key);

      if (existingItems && existingItems.length > 0) {
        const existingItem = existingItems.shift()!;
        return {
          ...existingItem,
          id: generateId(),
          value: value,
          isEnabled: !isCommented,
        };
      }
      return {
        id: generateId(),
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

export const KeyValueBulkEditor: React.FC<KeyValueBulkEditorProps> = ({
  data: propsData,
  onChange: propsOnChange,
  onClose,
  useStore,
}) => {
  const useStoreHook = useStore ?? (() => undefined);
  const storeData = useStoreHook((state: any) => state?.queryParams ?? state?.headers);
  const activeData = storeData ?? propsData;

  const [editorValue, setEditorValue] = useState(() => formatKeyValueText(activeData));

  const editorViewRef = useRef<EditorView | null>(null);
  const dataRef = useRef(activeData);
  const isInternalChange = useRef(false);
  const lastSyncedText = useRef<string | null>(null);

  const handleEditorReady = useCallback((view: EditorView) => {
    editorViewRef.current = view;
  }, []);

  useEffect(() => {
    dataRef.current = activeData;
  }, [activeData]);

  // Sync from Table -> Editor
  useEffect(() => {
    // Changing this flag allows the value inside the Editor to be changed by our formatter and chnages passed down from Table
    if (isInternalChange.current) {
      isInternalChange.current = false;
      lastSyncedText.current = formatKeyValueText(activeData);
      return;
    }

    const newText = formatKeyValueText(activeData);
    lastSyncedText.current = newText;

    const view = editorViewRef.current;
    if (view) {
      const currentDoc = view.state.doc.toString();
      if (currentDoc !== newText) {
        const mainSelection = view.state.selection.main;
        const safeAnchor = Math.min(mainSelection.anchor, newText.length);
        const safeHead = Math.min(mainSelection.head, newText.length);

        view.dispatch({
          changes: { from: 0, to: currentDoc.length, insert: newText },
          selection: EditorSelection.single(safeAnchor, safeHead),
          annotations: Transaction.remote.of(true),
        });
      }
    }
    setEditorValue(newText);
  }, [activeData]);

  const handleEditorChange = useCallback(
    (value: string) => {
      if (value === lastSyncedText.current) {
        return;
      }

      isInternalChange.current = true;
      setEditorValue(value);

      const parsed = parseKeyValueText(value, dataRef.current);
      propsOnChange(parsed);
    },
    [propsOnChange]
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
          onEditorReady={handleEditorReady}
          customTheme={whiteTextTheme}
          hideToolbar
          hideCharacterCount
          autoFocus={true}
          disableDefaultAutoCompletions={true}
        />
      </div>
      <div className="bulk-edit-panel-hint">{"Format: key:value | One row per line | Prepend // to disable a row"}</div>
    </div>
  );
};
