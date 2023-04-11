import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Modal, Steps, Button, Tooltip, Typography, Row } from "antd";
import { CopyOutlined, CheckCircleFilled } from "@ant-design/icons";
import { getDesktopSpecificDetails } from "../../../../../../store/selectors";
import { useNavigate } from "react-router-dom";
import { redirectToTraffic } from "utils/RedirectionUtils";

const { Title } = Typography;

const TerminalCommand = ({ helperServerPort }) => {
  const command = `. <(curl -sS localhost:${helperServerPort}/tpsetup)`;
  const [copyClicked, setCopyClicked] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", marginTop: 10 }}>
      <Title strong level={4} style={{ margin: 0 }}>
        <code
          style={{
            textAlign: "center",
            alignSelf: "center",
            userSelect: "all",
          }}
        >
          {command}
        </code>
      </Title>
      <Tooltip title={copyClicked ? "copied!" : "copy command"} color={copyClicked ? "green" : ""}>
        <Button
          type="secondary"
          icon={
            copyClicked ? (
              <CheckCircleFilled style={{ color: "green", fontSize: "0.9rem" }} />
            ) : (
              <CopyOutlined style={{ fontSize: "0.9rem" }} />
            )
          }
          style={{ margin: 0 }}
          size={"small"}
          onClick={() => {
            navigator.clipboard.writeText(command);
            setCopyClicked(true);
            setTimeout(() => setCopyClicked(false), 2000); // hide the flag after 2 seconds
          }}
        ></Button>
      </Tooltip>
    </div>
  );
};

const ExistingTerminalInstructionModal = ({ isVisible, handleCancel }) => {
  const navigate = useNavigate();
  const navigateToTraffic = () => {
    redirectToTraffic(navigate);
  };
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const { helperServerPort } = desktopSpecificDetails;
  return (
    <>
      <Row className="white header text-bold">Steps to setup terminal proxy</Row>
      <Row className="mt-8">
        <Steps direction="vertical" current={1}>
          <Steps.Step
            title="Run the command below in your terminal"
            status="process"
            description={<TerminalCommand helperServerPort={helperServerPort} />}
          />
        </Steps>
      </Row>
    </>
  );
};

export default ExistingTerminalInstructionModal;
