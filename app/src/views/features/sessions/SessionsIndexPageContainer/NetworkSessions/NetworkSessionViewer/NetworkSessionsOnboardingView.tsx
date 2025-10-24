import { useNavigate } from "react-router-dom";
import { Divider } from "antd";
import React, { useCallback } from "react";
import { CheckOutlined } from "@ant-design/icons";
import { Typography } from "antd";
import HarImportModal from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficExporter/HarImportModal";
import { redirectToNetworkSession } from "utils/RedirectionUtils";

// TODO: REFACTOR NETWORK SESSIONS COMPONENTS
const CheckItem: React.FC<{ label: string }> = ({ label }) => {
  return (
    <div>
      <CheckOutlined style={{ marginRight: "8px", fontSize: "16px", color: "#228B22" }} />
      <span>{label}</span>
    </div>
  );
};

export const NewtorkSessionsOnboardingView: React.FC<{}> = () => {
  const navigate = useNavigate();

  const { Title, Text } = Typography;
  const stableNavigate = useCallback(
    (sessionId: string) => {
      redirectToNetworkSession(navigate, sessionId);
    },
    [navigate]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        textAlign: "center",
        height: "100%",
        padding: "30px",
      }}
    >
      <Title level={1}>Record &amp; Replay your browsing sessions</Title>
      <Text type="secondary">
        <div>Record your network sessions and Share with others for offline review or debugging.</div>
      </Text>
      <div>
        <HarImportModal onSaved={stableNavigate} />
      </div>
      <Divider />
      <Text type="secondary">
        <div
          style={{
            display: "flex",
            justifyContent: "space-evenly",
            fontWeight: "bold",
          }}
        >
          <CheckItem label="Faster Debugging" />
          <CheckItem label="No need to reproduce" />
          <CheckItem label="Strict Privacy" />
        </div>
      </Text>
    </div>
  );
};
