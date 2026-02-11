import React, { useEffect, useMemo } from "react";
import { List, Popover, Tooltip } from "antd";
import { createPortal } from "react-dom";
import { ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import "./variableAutocompletePopover.scss";
import { InfoCircleOutlined } from "@ant-design/icons";
import { getScopeIcon } from "componentsV2/CodeEditor/components/EditorV2/components/VariablePopOver/hooks/useScopeOptions";
import { flattenVariablesList } from "../../utils";
import { DynamicVariableInfoPopover } from "../DynamicVariableInfoPopover/DynamicVariableInfoPopover";

interface VariableAutocompleteProps {
  show: boolean;
  position: { x: number; y: number };
  filter: string;
  variables: ScopedVariables | undefined;
  onSelect: (variableKey: string) => void;
  onClose: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
}

export const VariableAutocompletePopover: React.FC<VariableAutocompleteProps> = ({
  show,
  position,
  filter,
  variables,
  onSelect,
  onClose,
  editorRef,
}) => {
  const filteredVariables = useMemo(() => {
    if (!variables) return [];
    const flattened = flattenVariablesList(variables);
    // Filter variables based on the user's input
    if (!filter) return flattened;

    const lowerFilter = filter.toLowerCase();
    return flattened.filter((item) => item.label.toLowerCase().includes(lowerFilter));
  }, [variables, filter]);

  // Close autocomplete when clicking outside
  useEffect(() => {
    if (!show) return;

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(".variable-autocomplete-popup") && !editorRef?.current?.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [show, onClose, editorRef]);

  if (!show || filteredVariables.length === 0) return null;

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: position.y,
    left: position.x,
    zIndex: 9999,
  };

  const content = (
    <List
      size="small"
      dataSource={filteredVariables}
      renderItem={(item) => (
        <List.Item
          className="variable-autocomplete-item"
          onMouseDown={(e) => {
            // Use mousedown instead of click to fire before blur
            e.preventDefault();
            e.stopPropagation();
            onSelect(item.label);
          }}
          style={{ cursor: "pointer" }}
        >
          <div className="item-left-section">
            <Tooltip
              title={`Scope: ${item.scope} environment`}
              placement="top"
              showArrow={false}
              overlayClassName="scope-tooltip"
            >
              <span>{getScopeIcon(item.scope, false)}</span>
            </Tooltip>
            <span className="variable-label">{item.label}</span>
          </div>
          {item.scope === "global" && (
            <Tooltip
              title={<DynamicVariableInfoPopover variable={item} />}
              placement="rightTop"
              showArrow={false}
              overlayClassName="example-tooltip"
            >
              <InfoCircleOutlined className="info-icon" />
            </Tooltip>
          )}
        </List.Item>
      )}
    />
  );

  // Using createPortal to bypass antd styling overrides and ensure proper positioning
  return createPortal(
    <Popover
      content={content}
      open={show}
      destroyTooltipOnHide
      trigger={[]}
      placement="bottomLeft"
      overlayClassName="variable-autocomplete-popup"
      overlayInnerStyle={{ padding: 0 }}
    >
      <div style={popupStyle} />
    </Popover>,
    document.body
  );
};
