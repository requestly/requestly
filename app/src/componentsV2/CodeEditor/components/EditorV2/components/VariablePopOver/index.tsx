import React, { useState, useCallback } from "react";
import { Popover } from "antd";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";
import { capitalize } from "lodash";
import { pipe } from "lodash/fp";
import { ScopedVariable, ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { VariableData } from "features/apiClient/store/variables/types";
import { PopoverView } from "./types";
import { VariableNotFound } from "./components/VariableNotFound";
import { CreateVariableView } from "./components/CreateVariableView";
import { RQButton } from "lib/design-system-v2/components";
import { MdEdit } from "@react-icons/all-files/md/MdEdit";
import { getScopeIcon } from "./hooks/useScopeOptions";

// Define valid state transitions
const PopoverViewTransitions: Record<PopoverView, PopoverView[]> = {
  [PopoverView.VARIABLE_INFO]: [PopoverView.EDIT_FORM],
  [PopoverView.NOT_FOUND]: [PopoverView.CREATE_FORM],
  [PopoverView.CREATE_FORM]: [],
  [PopoverView.EDIT_FORM]: [PopoverView.VARIABLE_INFO],
};

interface VariablePopoverProps {
  hoveredVariable: string;
  popupPosition: { x: number; y: number };
  editorRef: React.RefObject<HTMLDivElement>;
  variables: ScopedVariables;
  onClose?: () => void;
  onPinChange?: (pinned: boolean) => void;
}

export const VariablePopover: React.FC<VariablePopoverProps> = ({
  hoveredVariable,
  editorRef,
  popupPosition,
  variables,
  onClose,
  onPinChange,
}) => {
  const variableData = variables.get(hoveredVariable);
  console.log({ variableData });
  // Determine initial view based on whether variable exists
  const initialView = variableData ? PopoverView.VARIABLE_INFO : PopoverView.NOT_FOUND;
  const [currentView, setCurrentView] = useState<PopoverView>(initialView);

  const transitionToView = useCallback(
    (nextView: PopoverView) => {
      const allowedTransitions = PopoverViewTransitions[currentView];
      if (!allowedTransitions.includes(nextView)) {
        console.error(`Invalid popover view transition from ${currentView} to ${nextView}`);
        return;
      }
      setCurrentView(nextView);
    },
    [currentView]
  );

  const handleCreateClick = useCallback(() => {
    transitionToView(PopoverView.CREATE_FORM);
    onPinChange?.(true); // Pin popover when entering create form
  }, [transitionToView, onPinChange]);

  const handleEditClick = useCallback(() => {
    transitionToView(PopoverView.EDIT_FORM);
    onPinChange?.(true);
  }, [transitionToView, onPinChange]);

  const handleSwitchEnvironment = useCallback(() => {
    window.dispatchEvent(new CustomEvent("trigger-env-switcher"));
    onClose?.();
  }, [onClose]);

  const handleCancel = useCallback(() => {
    if (currentView === PopoverView.CREATE_FORM) {
      onClose?.();
    } else if (currentView === PopoverView.EDIT_FORM) {
      transitionToView(PopoverView.VARIABLE_INFO);
    }
    onPinChange?.(false);
  }, [currentView, transitionToView, onPinChange, onClose]);

  const handleSave = useCallback(async () => {
    onPinChange?.(false);
    onClose?.();
  }, [onPinChange, onClose]);

  // Render content based on current view
  const popoverContent = (() => {
    switch (currentView) {
      case PopoverView.VARIABLE_INFO: {
        if (!variableData) return null;
        return (
          <VariableInfo
            params={{
              name: hoveredVariable,
              variable: variableData,
            }}
            onEditClick={handleEditClick}
          />
        );
      }

      case PopoverView.NOT_FOUND: {
        return <VariableNotFound onCreateClick={handleCreateClick} onSwitchEnvironment={handleSwitchEnvironment} />;
      }
      case PopoverView.CREATE_FORM: {
        return (
          <CreateVariableView
            variableName={hoveredVariable}
            mode="create"
            onCancel={handleCancel}
            onSave={handleSave}
          />
        );
      }
      case PopoverView.EDIT_FORM: {
        if (!variableData) return null;
        const [variable, source] = variableData;
        return (
          <CreateVariableView
            variableName={hoveredVariable}
            mode="edit"
            existingVariable={{
              type: variable.type,
              syncValue: variable.syncValue ?? "",
              localValue: variable.localValue ?? "",
              scope: source.scope,
              scopeName: source.name,
            }}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        );
      }

      default: {
        return null;
      }
    }
  })();

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: (popupPosition?.y ?? 0) - (editorRef.current?.getBoundingClientRect().top ?? 0) + 10,
    left: (popupPosition?.x ?? 0) - (editorRef.current?.getBoundingClientRect().left ?? 0) + 100,
    zIndex: 1000,
  };

  return (
    <Popover
      content={<div className="variable-info-body">{popoverContent}</div>}
      open
      destroyTooltipOnHide
      placement="bottom"
      showArrow={false}
      overlayClassName={`variable-info-popover ${
        currentView === PopoverView.CREATE_FORM || currentView === PopoverView.EDIT_FORM ? "create-form-view" : ""
      }`}
    >
      <div style={popupStyle} className="variable-info-div"></div>
    </Popover>
  );
};

function getSanitizedVariableValue(variable: VariableData) {
  const isSecret = variable.type === EnvironmentVariableType.Secret;
  const makeSecret = (value: VariableValueType) => "•".repeat(String(value || "").length);
  const makeRenderable = (value: VariableValueType) => `${value}`;

  const sanitize = pipe(
    (value: VariableValueType) => (value === undefined || value === null ? "" : value),
    isSecret ? makeSecret : makeRenderable
  );

  return {
    syncValue: sanitize(variable.syncValue ?? ""),
    localValue: sanitize(variable.localValue ?? ""),
    isPersisted: makeRenderable(variable.isPersisted ?? true),
  };
}

const VariableInfo: React.FC<{
  params: {
    name: string;
    variable: ScopedVariable;
  };
  onEditClick?: () => void;
}> = ({
  params: {
    name,
    variable: [variable, source],
  },
  onEditClick,
}) => {
  const { syncValue, localValue, isPersisted } = getSanitizedVariableValue(variable);
  const infoFields =
    source.scope === VariableScope.RUNTIME
      ? [
          { label: "Name", value: name },
          { label: "Type", value: capitalize(variable.type) },
          { label: "Current Value", value: localValue },
          { label: "Is persistent", value: isPersisted },
        ]
      : [
          { label: "Name", value: name },
          { label: "Type", value: capitalize(variable.type) },
          { label: "Initial Value", value: syncValue },
          { label: "Current Value", value: localValue },
        ];

  return (
    <>
      <div className="variable-info-property-container">
        {source.scope !== VariableScope.RUNTIME && (
          <>
            <span>{getScopeIcon(source.scope)} </span>
            <span className="variable-header-info-seperator"> </span>
            <div className="variable-info-header-name"> {source.name}</div>
          </>
        )}

        {/* Edit button - only for non-runtime variables */}
        {source.scope !== VariableScope.RUNTIME && onEditClick && (
          <RQButton
            type="transparent"
            size="small"
            icon={<MdEdit style={{ fontSize: "14px", color: "var(--requestly-color-text-subtle)" }} />}
            onClick={onEditClick}
            className="edit-variable-btn"
          >
            Edit
          </RQButton>
        )}
      </div>

      <div className="variable-info-content-container">
        <div className="variable-info-content">
          {infoFields.map(({ label, value }) => (
            <React.Fragment key={label}>
              <div className="variable-info-title">{label}</div>
              <div className="variable-info-value">{value}</div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
