import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import React from "react";
import { useContextId } from "features/apiClient/contexts/contextId.context";
import { RuntimeVariablesViewTabSource } from "./runtimevariablesTabSource";

//FIXME: Need to figure out what should be id here, title & context
export const RuntimeVariables: React.FC = () => {
  const [openTab] = useTabServiceWithSelector((state) => [state.openTab]);
  //FIXME: it comes null here
  const contextId = useContextId();
  return (
    <div
      className="runtime-variables-container"
      onClick={() => {
        openTab(new RuntimeVariablesViewTabSource({ id: "1", title: "runtime variables", context: { id: contextId } }));
      }}
    >
      Runtime variables
    </div>
  );
};
