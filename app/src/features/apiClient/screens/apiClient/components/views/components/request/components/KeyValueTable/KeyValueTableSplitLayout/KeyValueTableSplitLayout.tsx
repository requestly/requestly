import React, { useState, useMemo, useContext, useCallback } from "react";
import Split from "react-split";
import { BottomSheetPlacement, useBottomSheetContext } from "componentsV2/BottomSheet";
import { KeyValueBulkEditor } from "../KeyValueBulkEditor/KeyValueBulkEditor";
import { KeyValuePair } from "features/apiClient/types";
import "./keyValueTableSplitLayout.scss";

export interface BulkEditorState {
  data: KeyValuePair[];
  onChange: (updatedPairs: KeyValuePair[]) => void;
  title: string;
}

interface KeyValueTableSplitLayoutContextProps {
  bulkEditorState: BulkEditorState | null;
  openBulkEditor: (state: BulkEditorState) => void;
  closeBulkEditor: () => void;
  syncBulkEditor: (state: BulkEditorState) => void;
}

const KeyValueTableSplitLayoutContext = React.createContext<KeyValueTableSplitLayoutContextProps | null>(null);

export const useKeyValueTableSplitLayout = () => {
  const context = useContext(KeyValueTableSplitLayoutContext);
  return context;
};

export const KeyValueTableSplitLayout: React.FC<React.PropsWithChildren<{}>> = ({ children }) => {
  const { sheetPlacement } = useBottomSheetContext();
  const isBottomSheetAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  const [bulkEditorState, setBulkEditorState] = useState<BulkEditorState | null>(null);

  const openBulkEditor = useCallback((state: BulkEditorState) => {
    setBulkEditorState(state);
  }, []);

  const closeBulkEditor = useCallback(() => {
    setBulkEditorState(null);
  }, []);

  const syncBulkEditor = useCallback((state: BulkEditorState) => {
    setBulkEditorState((prev) => {
      if (!prev || prev.title !== state.title) return prev;
      if (prev.data === state.data && prev.onChange === state.onChange) return prev;
      return state;
    });
  }, []);

  const showBulkEditPanel = bulkEditorState !== null;

  const minSplitPanelSizes = useMemo(() => {
    if (!showBulkEditPanel) return [0, 0];
    if (isBottomSheetAtBottom) {
      return [600, 340];
    } else {
      return [200, 300];
    }
  }, [showBulkEditPanel, isBottomSheetAtBottom]);

  return (
    <KeyValueTableSplitLayoutContext.Provider
      value={{ bulkEditorState, openBulkEditor, closeBulkEditor, syncBulkEditor }}
    >
      <div className="table-container">
        <div className="table-content">
          <Split
            key={isBottomSheetAtBottom ? "horizontal" : "vertical"}
            className={`key-value-split-${isBottomSheetAtBottom ? "horizontal" : "vertical"} ${
              !showBulkEditPanel ? "bulk-editor-closed" : ""
            }`}
            direction={isBottomSheetAtBottom ? "horizontal" : "vertical"}
            sizes={showBulkEditPanel ? [75, 25] : [100, 0]}
            minSize={minSplitPanelSizes}
            gutterSize={showBulkEditPanel ? 6 : 0}
            style={{ height: "100%", overflow: "hidden" }}
          >
            <div className="key-value-table-split-panel-left">
              <div className="key-value-table">
                <div className="tab-scroll-container">{children}</div>
              </div>
            </div>

            <div className="key-value-table-split-panel-right">
              {showBulkEditPanel && bulkEditorState && (
                <KeyValueBulkEditor
                  data={bulkEditorState.data}
                  onChange={bulkEditorState.onChange}
                  onClose={closeBulkEditor}
                  tableTitle={bulkEditorState.title}
                />
              )}
            </div>
          </Split>
        </div>
      </div>
    </KeyValueTableSplitLayoutContext.Provider>
  );
};
