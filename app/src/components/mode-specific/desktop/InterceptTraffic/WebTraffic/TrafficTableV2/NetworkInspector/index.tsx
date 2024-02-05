import React from "react";
import { AutoThemeProvider } from "@devtools-ds/themes";

import NetworkTable from "./NetworkTable";

interface Props {
  logs: any;
  onRow: Function;
  isStaticPreview: boolean;
  setSelectedMockRequests?: Function;
}

const NetworkInspector: React.FC<Props> = (props) => {
  return (
    <AutoThemeProvider colorScheme={"dark"} style={{ height: "100%" }}>
      <NetworkTable
        logs={props.logs}
        onRow={props.onRow}
        isStaticPreview={props.isStaticPreview}
        setSelectedMockRequests={props.setSelectedMockRequests}
      />
    </AutoThemeProvider>
  );
};

export default NetworkInspector;
