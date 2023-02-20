import React, { useEffect, useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { ConfigProvider, theme } from "antd";
import { ThemeProvider } from "@devtools-ds/themes";
import "./index.css";
import NetworkPanel from "./components/NetworkPanel/NetworkPanel";
import { ColorScheme } from "./types";
import { getCurrentColorScheme, onColorSchemeChange } from "./utils";

const token = {
  borderRadius: 4,
  fontSize: 13,
};

const App: React.FC = () => {
  const [colorScheme, setColorScheme] = useState<ColorScheme>(
    getCurrentColorScheme()
  );

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

  return (
    <ConfigProvider theme={antDesignTheme}>
      <ThemeProvider theme={"chrome"} colorScheme={colorScheme}>
        <NetworkPanel />
      </ThemeProvider>
    </ConfigProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
