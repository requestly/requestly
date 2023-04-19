import React from "react";
import { YoutubeFilled } from "@ant-design/icons";
import { Button, Steps, Typography } from "antd";
import TutorialButton from "./TutorialButton";

interface Props {
  launchConfig: () => void;
}

const CreateSessionGuide: React.FC<Props> = ({ launchConfig }) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        margin: 30,
        padding: 30,
        rowGap: 50,
      }}
    >
      <Typography.Title level={2} style={{ textAlign: "center" }}>
        Record your first browsing session
      </Typography.Title>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          columnGap: 50,
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            rowGap: 30,
          }}
        >
          <Steps direction="vertical" size="small" current={1}>
            <Steps.Step
              title="Configure pages"
              description={
                <>
                  <Button type="link" onClick={launchConfig}>
                    Edit the configuration
                  </Button>
                </>
              }
            />
            <Steps.Step
              title="Browse webpages and view recorded session"
              description={
                <Typography.Text type="secondary">
                  When you browse configured webpages and notice a bug, click Requestly icon in browser extension
                  toolbar and click "View Recording" button in the popup
                </Typography.Text>
              }
            />
            <Steps.Step title="Save the recording" />
            <Steps.Step title="Share with your teammates" />
          </Steps>
          <TutorialButton>
            Watch full demo <YoutubeFilled style={{ color: "red", fontSize: 18, marginTop: 4 }} />
          </TutorialButton>
        </div>
        <img
          src="https://dhuecxx44iqxd.cloudfront.net/demo/view_session_recording_from_popup.gif"
          width="600"
          alt="See how to create session recording"
        />
      </div>
    </div>
  );
};

export default CreateSessionGuide;
