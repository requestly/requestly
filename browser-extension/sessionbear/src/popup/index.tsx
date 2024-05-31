import React from "react";
import ReactDOM from "react-dom";
import { ConfigProvider, theme } from "antd";
import Popup from "./components/Popup";
import "./index.css";

const aliasToken = {
  fontSize: 14,
  borderRadius: 4,
  controlHeight: 30,
  colorText: "#ffffff",
  colorTextTertiary: "#b0b0b5",
};

const App: React.FC = () => {
  return (
    <ConfigProvider theme={{ token: aliasToken, algorithm: [theme.darkAlgorithm] }}>      
      <Popup />
    </ConfigProvider>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
