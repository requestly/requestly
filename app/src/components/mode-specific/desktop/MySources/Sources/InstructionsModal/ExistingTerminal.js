import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Modal, Steps, Button, Tooltip, Typography, Row } from "antd";
import { CopyOutlined, CheckCircleFilled } from "@ant-design/icons";
import { getDesktopSpecificDetails } from "../../../../../../store/selectors";
import { useNavigate } from "react-router-dom";
import { redirectToTraffic } from "utils/RedirectionUtils";
import InstructionsHeader from "./InstructionsHeader";
import CompleteStep from "./common/Complete";

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

const ExistingTerminalInstructionModal = ({ setShowInstructions }) => {
  const navigate = useNavigate();
  const navigateToTraffic = () => {
    redirectToTraffic(navigate);
  };
  const desktopSpecificDetails = useSelector(getDesktopSpecificDetails);
  const { helperServerPort } = desktopSpecificDetails;
  return (
    <>
      <InstructionsHeader
        icon={window.location.origin + "/assets/img/thirdPartyAppIcons/terminal.png"}
        heading="Terminal proxy setup"
        description="Note: Follow the below mentioned steps to complete the setup."
        setShowInstructions={setShowInstructions}
      />
      <Row className="mt-8 setup-instructions-body">
        <Steps direction="vertical" current={1}>
          <Steps.Step
            title="Run the command below in your terminal"
            status="process"
            description={<TerminalCommand helperServerPort={helperServerPort} />}
          />
          <Steps.Step title="All Set to go" status="process" description={<CompleteStep appId="existing-terminal" />} />
        </Steps>
      </Row>
    </>
  );
};

export default ExistingTerminalInstructionModal;
