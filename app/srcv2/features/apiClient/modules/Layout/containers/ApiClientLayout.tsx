import React from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import Split from "react-split";

import useApiClientLayout from "../hooks/useApiClientLayout";

import Sidebar from "./Sidebar";

import "../styles.css";

const ApiClientLayout: React.FC = () => {
  const { getSecondPaneMinSize, isSetupDone } = useApiClientLayout();

  if (!isSetupDone) {
    return <div>Loading...</div>;
  }
  return (
    <DndProvider backend={HTML5Backend} context={window}>
      <div className="h-full w-full">
        <Split
          className="flex h-full w-full"
          direction="horizontal"
          sizes={[20, 80]}
          minSize={[300, getSecondPaneMinSize()]}
          gutter={(_, direction) => {
            const gutterContainer = document.createElement("div");
            gutterContainer.style.position = "relative";
            gutterContainer.className = `gutter-container gutter-container-${direction}`;
            gutterContainer.innerHTML = `<div class="absolute z-[1] h-full w-1 cursor-col-resize border-2 border-transparent bg-transparent transition-all duration-300 hover:border-primary active:border-primary" />`;
            return gutterContainer;
          }}
          gutterStyle={() => {
            return {
              height: "100%",
              width: "0px",
            };
          }}
          gutterAlign="center"
        >
          <Sidebar />
          <div>Tabs Container</div>
        </Split>
      </div>
    </DndProvider>
  );
};

export default ApiClientLayout;
