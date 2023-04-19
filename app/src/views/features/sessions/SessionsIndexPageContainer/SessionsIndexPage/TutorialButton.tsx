import { Button, ButtonProps, Modal } from "antd";
import React, { ReactNode, useCallback, useState } from "react";
import { trackDemoVideoOpened } from "modules/analytics/events/features/sessionRecording";

const DEMO_VIDEO_DIMENSIONS = {
  width: 560,
  height: 315,
};

interface Props {
  children: ReactNode;
}

const TutorialButton: React.FC<Props & ButtonProps> = ({ children, ...buttonProps }) => {
  const [isDemoModalVisible, setDemoModalVisible] = useState(false);

  const openDemoVideo = useCallback(() => {
    setDemoModalVisible(true);
    trackDemoVideoOpened();
  }, []);

  const closeDemoVideo = useCallback(() => {
    setDemoModalVisible(false);
  }, []);

  const openFeaturePage = useCallback(() => {
    window.open("https://requestly.io/feature/session-recording/", "blank");
  }, []);

  return (
    <>
      <Button {...buttonProps} onClick={openDemoVideo}>
        {children}
      </Button>
      <Modal
        title="About Session Recording"
        visible={isDemoModalVisible}
        width={`${DEMO_VIDEO_DIMENSIONS.width + 48}px`}
        bodyStyle={{ padding: 24 }}
        maskClosable={false}
        okText="Learn more"
        onOk={openFeaturePage}
        onCancel={closeDemoVideo}
        destroyOnClose
      >
        <iframe
          width={DEMO_VIDEO_DIMENSIONS.width}
          height={DEMO_VIDEO_DIMENSIONS.height}
          src="https://www.youtube.com/embed/g_qXQAzUQgU?start=74"
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </Modal>
    </>
  );
};

export default TutorialButton;
