import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ConfigProvider, Tabs, theme } from "antd";
import { ThemeProvider } from "@devtools-ds/themes";
import NetworkContainer from "./containers/network/NetworkContainer";
import ExecutionsContainer from "./containers/executions/ExecutionsContainer";
import { ColorScheme } from "./types";
import { getCurrentColorScheme, isExtensionManifestV3, onColorSchemeChange } from "./utils";
import { sendEventFromDevtool } from "../analytics/eventUtils";
import { EVENT_CONSTANTS } from "../analytics/eventContants";
import useLocalStorageState from "./hooks/useLocalStorageState";
import "./index.scss";

sendEventFromDevtool(EVENT_CONSTANTS.DEVTOOL_OPENED);

const token = {
  borderRadius: 4,
  fontSize: 13,
};

enum DevtoolsTabKeys {
  NETWORK = "network",
  EXECUTIONS = "executions",
}

const App: React.FC = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getCurrentColorScheme());
  const [selectedTab, setSelectedTab] = useLocalStorageState("lastTab", DevtoolsTabKeys.NETWORK);

  useEffect(() => {
    onColorSchemeChange(setColorScheme);
  }, []);

  const antDesignTheme = useMemo(() => {
    let algorithm = [theme.compactAlgorithm];

    if (colorScheme === ColorScheme.DARK) {
      algorithm.push(theme.darkAlgorithm);
    }

    return { token, algorithm };
  }, [colorScheme]);

  const isManifestV3 = useMemo(isExtensionManifestV3, []);

  return (
    <ConfigProvider theme={antDesignTheme}>
      <ThemeProvider theme={"chrome"} colorScheme={colorScheme}>
        {isManifestV3 ? (
          <NetworkContainer />
        ) : (
          <Tabs
            className="devtools-tabs"
            activeKey={selectedTab}
            onChange={setSelectedTab}
            tabPosition="left"
            tabBarStyle={{ minWidth: 150 }}
            tabBarGutter={0}
            items={[
              {
                label: "Network Traffic",
                key: DevtoolsTabKeys.NETWORK,
                children: <NetworkContainer />,
                forceRender: true,
              },
              {
                label: "Rule Executions",
                key: DevtoolsTabKeys.EXECUTIONS,
                children: <ExecutionsContainer />,
                forceRender: true,
              },
            ]}
          />
        )}
      </ThemeProvider>
    </ConfigProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
