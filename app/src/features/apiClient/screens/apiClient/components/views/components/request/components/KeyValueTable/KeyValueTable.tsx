import React, { useCallback, useMemo, useState, useRef, useEffect, useContext, createContext } from "react";
import type { TableProps } from "antd";
import { Tooltip } from "antd";
import { ContentListTable } from "componentsV2/ContentList";
import { MdAdd } from "@react-icons/all-files/md/MdAdd";
import { RQButton } from "lib/design-system-v2/components";
import { KeyValueTableEditableRow, KeyValueTableEditableCell } from "./KeyValueTableRow";
import { KeyValueTableSettingsDropdown } from "./KeyValueTableSettingsDropdown";
import { KeyValuePair, KeyValueDataType } from "features/apiClient/types";
import { RiDeleteBin6Line } from "@react-icons/all-files/ri/RiDeleteBin6Line";
import "./keyValueTable.scss";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { isFeatureCompatible } from "utils/CompatibilityUtils";
import FEATURES from "config/constants/sub/features";
import { doesValueMatchDataType } from "features/apiClient/screens/apiClient/utils";
import { capitalize } from "lodash";
import { AutoScrollContainer } from "../AutoScrollContainer";
import Split from "react-split";
import { BottomSheetPlacement, useBottomSheetContext } from "componentsV2/BottomSheet";
import { KeyValueBulkEditor } from "./KeyValueBulkEditor/KeyValueBulkEditor";

interface BulkEditRegistration {
  id: string;
  data: KeyValuePair[];
  onChange: (data: KeyValuePair[]) => void;
  title?: string;
}

interface KeyValueTableContextType {
  activeId: string | null;
  register: (config: BulkEditRegistration) => void;
  unregister: (id: string) => void;
  setActiveId: (id: string | null) => void;
  isEmbedded: boolean;
  triggerScroll: (target: React.RefObject<HTMLDivElement> | null) => void;
}

const KeyValueTableContext = createContext<KeyValueTableContextType | null>(null);

type ColumnTypes = Exclude<TableProps<KeyValuePair>["columns"], undefined>;

interface KeyValueTableProps {
  data: KeyValuePair[];
  onChange: (updatedPairs: KeyValuePair[]) => void;
  variables: ScopedVariables;
  extraColumns?: {
    description?: {
      visible: boolean;
      onToggle: (show: boolean) => void;
    };
    dataType?: {
      visible: boolean;
    };
  };
  config?: {
    checkInvalidCharacter?: boolean;
  };
  tableType?: string;
  headerContent?: React.ReactNode;
  isEmbedded?: boolean;
  hideIsEnabled?: boolean;
  hideFooter?: boolean;
}

export const KeyValueTable: React.FC<React.PropsWithChildren<KeyValueTableProps>> = ({
  data,
  variables,
  onChange,
  extraColumns,
  config,
  tableType,
  children,
  headerContent,
  isEmbedded = false,
  hideIsEnabled = false,
  hideFooter = false,
}) => {
  const { checkInvalidCharacter = false } = config || {};
  const context = useContext(KeyValueTableContext);

  const tableId = tableType ?? "key-value-table";

  const [registry, setRegistry] = useState<Record<string, BulkEditRegistration>>({});
  const [hostActiveId, setHostActiveId] = useState<string | null>(null);

  const [scrollFocus, setScrollFocus] = useState<{ triggerTs: any; target: React.RefObject<any> | null }>({
    triggerTs: -1,
    target: null,
  });

  const lastEntryRef = useRef<HTMLDivElement>(null);
  const embeddedScrollContainerRef = useRef<HTMLDivElement>(null);

  const register = useCallback(
    (config: BulkEditRegistration) => {
      if (isEmbedded && context) {
        context.register(config);
      } else {
        setRegistry((prev) => ({ ...prev, [config.id]: config }));
      }
    },
    [isEmbedded, context]
  );

  const unregister = useCallback(
    (id: string) => {
      if (isEmbedded && context) {
        context.unregister(id);
      } else {
        setRegistry((prev) => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    },
    [isEmbedded, context]
  );

  const setActiveId = useCallback(
    (id: string | null) => {
      if (isEmbedded && context) {
        context.setActiveId(id);
      } else {
        setHostActiveId(id);
      }
    },
    [isEmbedded, context]
  );

  const triggerScroll = useCallback(
    (target: React.RefObject<HTMLDivElement> | null) => {
      if (isEmbedded && context) {
        context.triggerScroll(target);
      } else {
        setScrollFocus({ triggerTs: Date.now(), target });
      }
    },
    [isEmbedded, context]
  );

  const activeId = isEmbedded && context ? context.activeId : hostActiveId;

  useEffect(() => {
    register({
      id: tableId,
      data,
      onChange,
      title: tableType,
    });
    return () => {
      unregister(tableId);
    };
  }, [tableId, data, onChange, tableType, register, unregister]);

  const prevDataLength = useRef(data.length);

  useEffect(() => {
    if (data.length > prevDataLength.current) {
      triggerScroll(isEmbedded ? null : lastEntryRef);
    }
    prevDataLength.current = data.length;
  }, [data.length, isEmbedded, triggerScroll]);

  const isDescriptionVisible =
    hasDescription(extraColumns) &&
    isFeatureCompatible(FEATURES.API_CLIENT_DESCRIPTION_COMPATIBILITY) &&
    extraColumns.description.visible;
  const isDataTypeVisible =
    hasDataType(extraColumns) &&
    extraColumns.dataType.visible &&
    isFeatureCompatible(FEATURES.API_CLIENT_KEY_VALUE_TABLE_DATA_TYPE_COMPATIBILITY);

  const { sheetPlacement } = useBottomSheetContext();
  const isBottomSheetAtBottom = sheetPlacement === BottomSheetPlacement.BOTTOM;

  const createEmptyPair = useCallback(
    () => ({
      id: Date.now(),
      key: "",
      value: "",
      isEnabled: true,
      description: "",
      dataType: KeyValueDataType.STRING,
    }),
    []
  );

  const memoizedData: KeyValuePair[] = useMemo(() => {
    if (data.length) {
      return data;
    } else {
      const emptyData = createEmptyPair();
      return [emptyData];
    }
  }, [data, createEmptyPair]);

  const handleUpdateRequestPairs = useCallback(
    (pair: KeyValuePair, action: "add" | "update" | "delete") => {
      let keyValuePairs = [...memoizedData];

      if (pair) {
        switch (action) {
          case "add":
            keyValuePairs.push(pair);
            break;
          case "update": {
            const index = keyValuePairs.findIndex((item: KeyValuePair) => item.id === pair.id);
            if (index !== -1) {
              keyValuePairs.splice(index, 1, {
                ...keyValuePairs[index],
                ...pair,
              });
            }
            break;
          }
          case "delete": {
            keyValuePairs = keyValuePairs.filter((item: KeyValuePair) => item.id !== pair.id);
            break;
          }
          default:
            break;
        }
      }

      onChange(keyValuePairs);
    },
    [onChange, memoizedData]
  );

  const handleUpdatePair = useCallback(
    (pair: KeyValuePair) => {
      handleUpdateRequestPairs(pair, "update");
    },
    [handleUpdateRequestPairs]
  );

  const handleAddPair = useCallback(() => {
    const newPair = createEmptyPair();
    handleUpdateRequestPairs(newPair, "add");
  }, [createEmptyPair, handleUpdateRequestPairs]);

  const handleDeletePair = useCallback(
    (pair: KeyValuePair) => {
      handleUpdateRequestPairs(pair, "delete");
    },
    [handleUpdateRequestPairs]
  );

  const columns = useMemo(() => {
    return [
      !hideIsEnabled
        ? {
            title: "",
            dataIndex: "isEnabled",
            width: "40px",
            editable: true,
            className: "kv-col-border-right",
            onCell: (record: KeyValuePair) => ({
              record,
              editable: true,
              dataIndex: "isEnabled",
              variables,
              handleUpdatePair,
            }),
          }
        : null,
      {
        title: "Key",
        dataIndex: "key",
        width: isDescriptionVisible ? "30%" : "50%",
        editable: true,
        className: "kv-col-border-right",
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "key",
          title: "key",
          variables,
          checkInvalidCharacter,
          handleUpdatePair,
        }),
      },
      {
        title: "Value",
        dataIndex: "value",
        editable: true,
        width: isDescriptionVisible ? "30%" : "50%",
        className: "kv-col-border-right",
        onCell: (record: KeyValuePair) => ({
          record,
          editable: true,
          dataIndex: "value",
          title: "value",
          variables,
          handleUpdatePair,
          error: doesValueMatchDataType(record.value, record.dataType ?? KeyValueDataType.STRING)
            ? null
            : `Value must be ${capitalize(record.dataType ?? KeyValueDataType.STRING)}`,
        }),
      },
      isDataTypeVisible
        ? {
            title: "Type",
            dataIndex: "dataType",
            width: isDescriptionVisible ? 110 : 120,
            editable: true,
            onCell: (record: KeyValuePair) => ({
              record,
              editable: true,
              dataIndex: "dataType",
              title: "type",
              variables,
              handleUpdatePair,
            }),
          }
        : null,
      isDescriptionVisible
        ? {
            title: "Description",
            dataIndex: "description",
            width: "40%",
            editable: true,
            onCell: (record: KeyValuePair) => ({
              record,
              editable: true,
              dataIndex: "description",
              title: "description",
              variables,
              handleUpdatePair,
            }),
          }
        : null,
      {
        width: "50px",
        fixed: "right",
        title: () =>
          isDataTypeVisible &&
          hasDescription(extraColumns) && (
            <div className="key-value-table-header-actions">
              <KeyValueTableSettingsDropdown
                showDescription={isDescriptionVisible}
                onToggleDescription={extraColumns.description.onToggle}
              />
              <Tooltip
                title={`Bulk edit ${tableType} as key:value pairs`}
                color="#000000"
                mouseEnterDelay={0.2}
                placement="right"
                overlayClassName="key-value-bulk-edit-tooltip"
              >
                <RQButton
                  size="small"
                  onClick={() => setActiveId(activeId === tableId ? null : tableId)}
                  className={`key-value-bulk-edit-button ${activeId === tableId ? "active" : ""}`}
                >
                  Bulk edit
                </RQButton>
              </Tooltip>
            </div>
          ),
        render: (_: any, record: KeyValuePair) => {
          if (record.key === "" && record.value === "" && data.length === 1) {
            return null;
          }

          return (
            <RQButton
              className="key-value-delete-btn"
              icon={<RiDeleteBin6Line />}
              type="transparent"
              size="small"
              onClick={() => handleDeletePair(record)}
            />
          );
        },
      },
    ].filter(Boolean);
  }, [
    isDataTypeVisible,
    isDescriptionVisible,
    variables,
    handleUpdatePair,
    checkInvalidCharacter,
    extraColumns,
    data.length,
    handleDeletePair,
    tableType,
    hideIsEnabled,
    activeId,
    tableId,
    setActiveId,
  ]);

  const minSplitPanelSizes = useMemo(() => {
    if (!activeId) return [0, 0];
    return isBottomSheetAtBottom ? [600, 340] : [200, 300];
  }, [activeId, isBottomSheetAtBottom]);

  const RenderedTable = (
    <ContentListTable
      id={`api-key-value-table-${tableId}`}
      className="api-key-value-table"
      bordered={false}
      showHeader={isDataTypeVisible}
      rowKey="id"
      columns={columns as ColumnTypes}
      data={memoizedData}
      locale={{ emptyText: `No entries found` }}
      components={{ body: { row: KeyValueTableEditableRow, cell: KeyValueTableEditableCell } }}
      scroll={{ x: 550 }}
      footer={
        hideFooter
          ? undefined
          : () => (
              <div className="api-key-value-table-footer">
                <RQButton icon={<MdAdd />} size="small" onClick={handleAddPair} className="key-value-add-more-btn">
                  Add More
                </RQButton>
              </div>
            )
      }
    />
  );

  if (isEmbedded) {
    return (
      <div className="embedded-key-value-table" ref={embeddedScrollContainerRef}>
        {headerContent}
        {RenderedTable}
        {children}
      </div>
    );
  }

  const activeEditorConfig = activeId ? registry[activeId] : null;

  const hostWrapperStyle = !isEmbedded
    ? isBottomSheetAtBottom
      ? { minWidth: minSplitPanelSizes[0] }
      : { minHeight: minSplitPanelSizes[0] }
    : undefined;

  return (
    <KeyValueTableContext.Provider
      value={{
        activeId: hostActiveId,
        register,
        unregister,
        setActiveId: setHostActiveId,
        isEmbedded: true,
        triggerScroll: (target) => setScrollFocus({ triggerTs: Date.now(), target }),
      }}
    >
      <Split
        key={isBottomSheetAtBottom ? "horizontal" : "vertical"}
        className={`key-value-split-${isBottomSheetAtBottom ? "horizontal" : "vertical"}`}
        direction={isBottomSheetAtBottom ? "horizontal" : "vertical"}
        sizes={activeId ? [75, 25] : [100, 0]}
        minSize={minSplitPanelSizes}
        gutterSize={activeId ? 6 : 0}
      >
        <div style={{ display: "flex", flexDirection: "column", height: "100%", ...hostWrapperStyle }}>
          {headerContent}
          <div className="key-value-table" style={{ flex: 1, minHeight: 0, position: "relative" }}>
            <AutoScrollContainer trigger={scrollFocus.triggerTs} scrollTargetRef={scrollFocus.target}>
              <div>
                {RenderedTable}
                <div ref={lastEntryRef} />
                {children}
              </div>
            </AutoScrollContainer>
          </div>
        </div>

        <div
          className="key-value-bulk-editor"
          style={isBottomSheetAtBottom ? { minWidth: minSplitPanelSizes[1] } : { minHeight: minSplitPanelSizes[1] }}
        >
          {activeEditorConfig && (
            <KeyValueBulkEditor
              data={activeEditorConfig.data}
              onChange={activeEditorConfig.onChange}
              onClose={() => setActiveId(null)}
              tableTitle={activeEditorConfig.title}
            />
          )}
        </div>
      </Split>
    </KeyValueTableContext.Provider>
  );
};

function hasDescription<T extends { description?: unknown }>(
  config?: T
): config is T & { description: NonNullable<T["description"]> } {
  return !!config && !!config.description;
}

function hasDataType<T extends { dataType?: unknown }>(
  config?: T
): config is T & { dataType: NonNullable<T["dataType"]> } {
  return !!config && !!config.dataType;
}
