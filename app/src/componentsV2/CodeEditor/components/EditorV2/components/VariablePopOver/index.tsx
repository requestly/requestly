import React, { useState, useCallback, useMemo } from "react";
import { Popover } from "antd";
import { EnvironmentVariableType, VariableScope, VariableValueType } from "backend/environment/types";
import { capitalize } from "lodash";
import { ScopedVariable, ScopedVariables } from "features/apiClient/helpers/variableResolver/variable-resolver";
import { VariableData } from "features/apiClient/store/variables/types";
import { PopoverView } from "./types";
import { VariableNotFound } from "./components/VariableNotFound";
import { CreateVariableView } from "./components/CreateVariableView";
import { EditVariableView } from "./components/EditVariableView";
import { RQButton } from "lib/design-system-v2/components";
import { MdEdit } from "@react-icons/all-files/md/MdEdit";
import { RiEyeLine } from "@react-icons/all-files/ri/RiEyeLine";
import { RiEyeOffLine } from "@react-icons/all-files/ri/RiEyeOffLine";
import { getScopeIcon } from "./hooks/useScopeOptions";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { NoopContextId } from "features/apiClient/store/apiClientFeatureContext/apiClientFeatureContext.store";
import { captureMessage } from "@sentry/react";

const PopoverViewTransitions: Record<PopoverView, PopoverView[]> = {
  [PopoverView.IDLE]: [PopoverView.VARIABLE_INFO, PopoverView.NOT_FOUND],
  [PopoverView.VARIABLE_INFO]: [PopoverView.EDIT_FORM, PopoverView.IDLE],
  [PopoverView.NOT_FOUND]: [PopoverView.CREATE_FORM, PopoverView.IDLE],
  [PopoverView.CREATE_FORM]: [PopoverView.IDLE],
  [PopoverView.EDIT_FORM]: [PopoverView.VARIABLE_INFO, PopoverView.IDLE],
};

interface VariablePopoverProps {
  hoveredVariable: string;
  popupPosition: { x: number; y: number };
  editorRef: React.RefObject<HTMLDivElement>;
  variables: ScopedVariables;
  onClose?: () => void;
  onPinChange?: (pinned: boolean) => void;
}
enum InfoFieldLabel {
  NAME = "Name",
  TYPE = "Type",
  INITIAL_VALUE = "Initial Value",
  CURRENT_VALUE = "Current Value",
  IS_PERSISTENT = "Is persistent",
}
interface InfoFieldConfig {
  label: InfoFieldLabel;
  value: string | boolean;
  isSecret?: boolean;
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
  const contextId = useContextId();
  const isNoopContext = contextId === NoopContextId;

  const [currentView, setCurrentView] = useState<PopoverView>(() => {
    return variableData ? PopoverView.VARIABLE_INFO : PopoverView.NOT_FOUND;
  });

  const transitionToView = useCallback(
    (nextView: PopoverView) => {
      const allowedTransitions = PopoverViewTransitions[currentView];
      if (!allowedTransitions.includes(nextView)) {
        const message = `Invalid popover view transition from ${currentView} to ${nextView}`;
        captureMessage(message, {
          level: "info",
        });
        return;
      }
      setCurrentView(nextView);
    },
    [currentView]
  );

  const handleCreateClick = useCallback(() => {
    transitionToView(PopoverView.CREATE_FORM);
    onPinChange?.(true);
  }, [transitionToView, onPinChange]);

  const handleEditClick = useCallback(() => {
    transitionToView(PopoverView.EDIT_FORM);
    onPinChange?.(true);
  }, [transitionToView, onPinChange]);

  const handleSwitchEnvironment = useCallback(() => {
    window.dispatchEvent(new CustomEvent("trigger-env-switcher", { detail: { contextId } }));
    onClose?.();
  }, [onClose, contextId]);

  const handleCancel = useCallback(() => {
    if (currentView === PopoverView.CREATE_FORM) {
      transitionToView(PopoverView.IDLE);
      onClose?.();
    } else if (currentView === PopoverView.EDIT_FORM) {
      transitionToView(PopoverView.VARIABLE_INFO);
    }
    onPinChange?.(false);
  }, [currentView, transitionToView, onPinChange, onClose]);

  const handleSave = useCallback(async () => {
    transitionToView(PopoverView.IDLE);
    onPinChange?.(false);
    onClose?.();
  }, [transitionToView, onClose, onPinChange]);

  const popoverContent = (() => {
    switch (currentView) {
      case PopoverView.IDLE: {
        return null;
      }

      case PopoverView.VARIABLE_INFO: {
        if (!variableData) return null;
        return (
          <VariableInfo
            params={{
              name: hoveredVariable,
              variable: variableData,
            }}
            onEditClick={handleEditClick}
            isNoopContext={isNoopContext}
          />
        );
      }

      case PopoverView.NOT_FOUND: {
        return (
          <VariableNotFound
            isNoopContext={isNoopContext}
            onCreateClick={handleCreateClick}
            onSwitchEnvironment={handleSwitchEnvironment}
          />
        );
      }

      case PopoverView.CREATE_FORM: {
        return <CreateVariableView variableName={hoveredVariable} onCancel={handleCancel} onSave={handleSave} />;
      }

      case PopoverView.EDIT_FORM: {
        if (!variableData) return null;
        const [variable, source] = variableData;
        return (
          <EditVariableView
            variableName={hoveredVariable}
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

  if (currentView === PopoverView.IDLE) {
    return null;
  }

  const popupStyle: React.CSSProperties = {
    position: "absolute",
    top: (popupPosition?.y ?? 0) - (editorRef.current?.getBoundingClientRect().top ?? 0) + 10,
    left: (popupPosition?.x ?? 0) - (editorRef.current?.getBoundingClientRect().left ?? 0) + 100,
    zIndex: 1000,
  };

  const isFormMode = currentView === PopoverView.CREATE_FORM || currentView === PopoverView.EDIT_FORM;

  return (
    <Popover
      content={<div className="variable-info-body">{popoverContent}</div>}
      open
      destroyTooltipOnHide
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onPinChange?.(false);
          onClose?.();
        }
      }}
      trigger={isFormMode ? [] : ["click"]}
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

function getValueStrings(variable: VariableData) {
  const makeRenderable = (value: VariableValueType) => `${value}`;

  return {
    syncValue: makeRenderable(variable.syncValue ?? ""),
    localValue: makeRenderable(variable.localValue ?? ""),
    isPersisted: makeRenderable(variable.isPersisted ?? true),
  };
}

const VariableInfo: React.FC<{
  params: {
    name: string;
    variable: ScopedVariable;
  };
  onEditClick?: () => void;
  isNoopContext: boolean;
}> = ({
  params: {
    name,
    variable: [variable, source],
  },
  onEditClick,
  isNoopContext,
}) => {
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, boolean>>({});
  const { syncValue, localValue, isPersisted } = getValueStrings(variable);
  const isSecretType = variable.type === EnvironmentVariableType.Secret;
  const infoFields: InfoFieldConfig[] = useMemo(() => {
    const commonFields = [
      { label: InfoFieldLabel.NAME, value: name },
      { label: InfoFieldLabel.TYPE, value: capitalize(variable.type) },
    ];

    if (source.scope === VariableScope.RUNTIME) {
      return [
        ...commonFields,
        {
          label: InfoFieldLabel.CURRENT_VALUE,
          value: localValue,
          isSecret: isSecretType,
        },
        { label: InfoFieldLabel.IS_PERSISTENT, value: isPersisted },
      ];
    }

    return [
      ...commonFields,
      {
        label: InfoFieldLabel.INITIAL_VALUE,
        value: syncValue,
        isSecret: isSecretType,
      },
      {
        label: InfoFieldLabel.CURRENT_VALUE,
        value: localValue,
        isSecret: isSecretType,
      },
    ];
  }, [source.scope, name, variable.type, localValue, isPersisted, syncValue, isSecretType]);

  const toggleVisibility = useCallback((key: InfoFieldLabel) => {
    setRevealedSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  return (
    <>
      <div className="variable-info-property-container">
        <span>{getScopeIcon(source.scope)}</span>
        <span className="variable-header-info-seperator" />
        <div className="variable-info-header-name">{source.name}</div>

        <RQButton
          type="transparent"
          size="small"
          icon={<MdEdit className="edit-icon" />}
          onClick={onEditClick}
          className="edit-variable-btn"
        >
          Edit
        </RQButton>
      </div>

      <div className="variable-info-content-container">
        <div className="variable-info-content">
          {infoFields.map((field) => (
            <React.Fragment key={field.label}>
              <div className="variable-info-title">{field.label}</div>

              <div className={`variable-info-value ${field.isSecret ? "with-toggle" : ""}`}>
                <span className="value-content">
                  {field.isSecret ? (
                    revealedSecrets[field.label] ? (
                      <span className="secret-revealed">{String(field.value)}</span>
                    ) : (
                      <span className="secret-masked">{"•".repeat(Math.min(String(field.value).length, 15))}</span>
                    )
                  ) : (
                    <span>{String(field.value)}</span>
                  )}
                </span>

                {field.isSecret && (
                  <div className="eye-toggle-button">
                    <RQButton
                      type="transparent"
                      size="small"
                      icon={revealedSecrets[field.label] ? <RiEyeLine /> : <RiEyeOffLine />}
                      onClick={() => toggleVisibility(field.label)}
                    />
                  </div>
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
