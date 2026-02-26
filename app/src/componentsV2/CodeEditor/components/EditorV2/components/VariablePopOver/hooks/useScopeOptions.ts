import { useMemo } from "react";
import React from "react";
import { VariableScope } from "backend/environment/types";
import type { ScopeOption } from "../types";
import { MdOutlineCategory } from "@react-icons/all-files/md/MdOutlineCategory";
import { BiNote } from "@react-icons/all-files/bi/BiNote";
import { BsGlobeCentralSouthAsia } from "@react-icons/all-files/bs/BsGlobeCentralSouthAsia";
import { MdHorizontalSplit } from "@react-icons/all-files/md/MdHorizontalSplit";
import { useActiveEnvironment } from "features/apiClient/slices";
import { useWorkspaceId } from "features/apiClient/common/WorkspaceProvider";
import { GLOBAL_ENVIRONMENT_ID, RUNTIME_VARIABLES_ENTITY_ID } from "features/apiClient/slices/common/constants";
import { NoopContextId } from "features/apiClient/commands/utils";

interface UseScopeOptionsResult {
  scopeOptions: ScopeOption[];
  defaultScope: VariableScope;
}

const createIconWithWrapper = (
  IconComponent: React.ComponentType<{ style?: React.CSSProperties }>,
  iconColor: string,
  bgColor: string = "transparent",
  text?: string
) => {
  return React.createElement(
    "div",
    {
      style: {
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        padding: "0 6px",
        height: "16px",
        backgroundColor: bgColor,
        borderRadius: "4px",
        fontSize: "10px",
        lineHeight: 1,
        whiteSpace: "nowrap",
      },
    },
    React.createElement(IconComponent, {
      style: {
        color: iconColor,
        height: "12px",
        width: "12px",
        flexShrink: 0,
      },
    }),
    text ? React.createElement("span", { style: { color: iconColor } }, text) : null
  );
};

export const getScopeIcon = (
  scope: VariableScope,
  config?: {
    showBackgroundColor?: boolean;
    showText?: boolean;
  }
): React.ReactNode => {
  const { showBackgroundColor = true, showText = false } = config ?? {};

  switch (scope) {
    case VariableScope.ENVIRONMENT:
      return createIconWithWrapper(
        MdHorizontalSplit,
        "var(--requestly-color-primary-text)",
        showBackgroundColor ? "var(--requestly-color-primary-darker)" : "transparent"
      );
    case VariableScope.COLLECTION:
      return createIconWithWrapper(
        BiNote,
        "var(--requestly-color-text-subtle)",
        showBackgroundColor ? "var(--requestly-color-surface-2)" : "transparent"
      );
    case VariableScope.GLOBAL:
    case VariableScope.DYNAMIC:
      return createIconWithWrapper(
        BsGlobeCentralSouthAsia,
        "var(--requestly-color-success-text)",
        showBackgroundColor ? "var(--requestly-color-success-darker)" : "transparent",
        scope === VariableScope.DYNAMIC && showText ? "DYNAMIC" : undefined
      );
    case VariableScope.RUNTIME:
      return createIconWithWrapper(
        MdOutlineCategory,
        "var(--requestly-color-warning-dark)",
        showBackgroundColor ? "var(--requestly-color-warning-darker)" : "transparent"
      );
    default:
      return null;
  }
};

export const useScopeOptions = (collectionId?: string): UseScopeOptionsResult => {
  const activeEnvironment = useActiveEnvironment();
  const workspaceId = useWorkspaceId();
  const isNoopContext = workspaceId === NoopContextId;

  return useMemo(() => {
    const options: ScopeOption[] = [
      {
        value: VariableScope.ENVIRONMENT,
        label: activeEnvironment ? "Current environment" : "No Active Environment",
        icon: getScopeIcon(VariableScope.ENVIRONMENT),
        disabled: !activeEnvironment,
        id: activeEnvironment?.id,
      },
      {
        value: VariableScope.COLLECTION,
        label: "Current collection",
        icon: getScopeIcon(VariableScope.COLLECTION),
        disabled: !collectionId,
        id: collectionId,
      },
      {
        value: VariableScope.GLOBAL,
        label: "Global",
        icon: getScopeIcon(VariableScope.GLOBAL),
        disabled: isNoopContext,
        id: GLOBAL_ENVIRONMENT_ID,
      },
      {
        value: VariableScope.RUNTIME,
        label: "Runtime variables",
        icon: getScopeIcon(VariableScope.RUNTIME),
        disabled: false,
        id: RUNTIME_VARIABLES_ENTITY_ID,
      },
    ];

    // Determine default scope based on availability
    let defaultScope: VariableScope;
    if (isNoopContext) {
      defaultScope = VariableScope.RUNTIME;
    } else if (activeEnvironment) {
      defaultScope = VariableScope.ENVIRONMENT;
    } else if (collectionId) {
      defaultScope = VariableScope.COLLECTION;
    } else {
      defaultScope = VariableScope.GLOBAL;
    }

    return { scopeOptions: options, defaultScope };
  }, [activeEnvironment, collectionId, isNoopContext]);
};
