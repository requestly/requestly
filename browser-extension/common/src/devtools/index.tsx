import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ConfigProvider, Tabs, theme } from "antd";
import { ThemeProvider } from "@devtools-ds/themes";
import NetworkContainer from "./containers/network/NetworkContainer";
import ExecutionsContainer from "./containers/executions/ExecutionsContainer";
import { ColorScheme } from "./types";
import { getCurrentColorScheme, isExtensionManifestV3, onColorSchemeChange } from "./utils";
import "./index.scss";

const token = {
  borderRadius: 4,
  fontSize: 13,
};

const App: React.FC = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(getCurrentColorScheme());

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
            defaultActiveKey="1"
            tabPosition="left"
            tabBarStyle={{ minWidth: 150 }}
            tabBarGutter={0}
            items={[
              {
                label: "Network Traffic",
                key: "network",
                children: <NetworkContainer />,
                forceRender: true,
              },
              {
                label: "Rule Executions",
                key: "executions",
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

// TODO: send analytics event: sendEventFromDevtool()
