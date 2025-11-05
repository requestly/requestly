import { useMemo } from "react";
import React from "react";
import { VariableScope } from "backend/environment/types";
import { ScopeOption } from "../types";
import { useActiveEnvironment } from "features/apiClient/hooks/useActiveEnvironment.hook";
import { MdOutlineStorage } from "@react-icons/all-files/md/MdOutlineStorage";
import { AiOutlineFolder } from "@react-icons/all-files/ai/AiOutlineFolder";
import { AiOutlineGlobal } from "@react-icons/all-files/ai/AiOutlineGlobal";
import { AiOutlineClockCircle } from "@react-icons/all-files/ai/AiOutlineClockCircle";

interface UseScopeOptionsResult {
  scopeOptions: ScopeOption[];
  defaultScope: VariableScope;
}

export const useScopeOptions = (collectionId?: string): UseScopeOptionsResult => {
  const activeEnvironment = useActiveEnvironment();

  return useMemo(() => {
    const options: ScopeOption[] = [
      {
        value: VariableScope.ENVIRONMENT,
        label: activeEnvironment ? `Current environment` : "No Active Environment",
        icon: React.createElement(MdOutlineStorage, { style: { color: "#4F90F0" } }),
        disabled: !activeEnvironment,
      },
      {
        value: VariableScope.COLLECTION,
        label: "Current collection",
        icon: React.createElement(AiOutlineFolder, { style: { color: "#999" } }),
        disabled: !collectionId,
      },
      {
        value: VariableScope.GLOBAL,
        label: "Global",
        icon: React.createElement(AiOutlineGlobal, { style: { color: "#52C41A" } }),
        disabled: false,
      },
      {
        value: VariableScope.RUNTIME,
        label: "Runtime variables",
        icon: React.createElement(AiOutlineClockCircle, { style: { color: "#D4752E" } }),
        disabled: false,
      },
    ];

    // Determine default scope based on availability
    let defaultScope: VariableScope;
    if (activeEnvironment) {
      defaultScope = VariableScope.ENVIRONMENT;
    } else if (collectionId) {
      defaultScope = VariableScope.COLLECTION;
    } else {
      defaultScope = VariableScope.GLOBAL;
    }

    return { scopeOptions: options, defaultScope };
  }, [activeEnvironment, collectionId]);
};
