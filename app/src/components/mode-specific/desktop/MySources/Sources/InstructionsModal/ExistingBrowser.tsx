import React, { useMemo } from "react";
import { Button, Col, Image, List, Row, Steps } from "antd";
import InstructionsHeader from "./InstructionsHeader";
import { getLinkWithMetadata } from "modules/analytics/metadata";

const ExistingBrowserInstructionModal: React.FC<{
  setShowInstructions: () => void;
  handleActivateAppOnClick: (appId: string) => void;
  appId: string;
}> = ({ setShowInstructions, handleActivateAppOnClick, appId }) => {
  const instructionSteps: {
    title: string;
    status: "process" | "finish" | "wait" | "error";
    description: React.ReactNode;
  }[] = useMemo(() => {
    return [
      {
        title: "Install Requestly Extension in your browser profile",
        status: "process",
        description: (
          <Row>
            <Col span={16}>
              <List itemLayout="horizontal">
                <List.Item>
                  <List.Item.Meta
                    title={
                      <>
                        a. Install Requestly Extension from{" "}
                        <a href={getLinkWithMetadata("https://requestly.com")} target="__blank">
                          requestly.com
                        </a>
                      </>
                    }
                  />
                </List.Item>
              </List>
            </Col>
            <Col span={2}></Col>
          </Row>
        ),
      },
      {
        title: "Open Requestly Extension Popup",
        status: "process",
        description: (
          <>
            <List itemLayout="vertical">
              <List.Item>
                <List.Item.Meta
                  title={"a. Click on the connect button to connect the browser profile with the desktop app."}
                  description="It is only visible when the desktop app is open."
                />
                <List.Item.Meta title={"b. You can now succesfully intercept the traffic from this browser profile."} />
              </List.Item>
            </List>
            <Row>
              <Image src={"/assets/media/components/existing_browser_connection.png"} />
            </Row>
          </>
        ),
      },
      {
        title: "Disconnect from the existing browser profile",
        status: "process",
        description: (
          <List itemLayout="horizontal">
            <List.Item>
              <List.Item.Meta
                title={
                  "You can disconnect from the browser profile by clicking on the disconnect button as well as from the desktop app."
                }
              />
            </List.Item>
          </List>
        ),
      },
    ];
  }, []);

  return (
    <>
      <InstructionsHeader
        icon={window.location.origin + "/assets/media/components/chrome.png"}
        heading="Connect Existing Browser Profile"
        description={
          <Col>
            If you can close your current browsing session, simply click the button to relaunch it. <br />
            If you'd rather not close it, follow the steps below instead.
          </Col>
        }
        setShowInstructions={setShowInstructions}
        ExtraContentOnRight={
          <Col className="mt-20">
            <Button onClick={() => handleActivateAppOnClick(appId)}>Relaunch Browser</Button>
          </Col>
        }
      />

      <Row className="mt-8 setup-instructions-body">
        <Steps direction="vertical" current={1} className="mt-8">
          {instructionSteps.map((step, key) => (
            <Steps.Step key={key} title={step.title} status={step.status} description={step.description} />
          ))}
        </Steps>
      </Row>
    </>
  );
};

export default ExistingBrowserInstructionModal;
