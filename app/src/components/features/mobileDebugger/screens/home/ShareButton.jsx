import { ShareAltOutlined } from "@ant-design/icons";
import { Button, Tooltip } from "antd";
import { useState } from "react";

import ShareAppAccessModal from "./ShareAppAccessModal";
import { trackAndroidDebuggerShareClicked } from "modules/analytics/events/features/mobileDebugger";

const ShareButton = ({ appDetails }) => {
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  return (
    <>
      <Tooltip title="Share app with teammates and debug together" placement="right">
        <Button
          type="primary"
          icon={<ShareAltOutlined />}
          onClick={() => {
            trackAndroidDebuggerShareClicked();
            setIsShareModalVisible(true);
          }}
        >
          Share
        </Button>
      </Tooltip>

      {isShareModalVisible ? (
        <ShareAppAccessModal
          isVisible={isShareModalVisible}
          setVisible={setIsShareModalVisible}
          appId={appDetails["id"]}
          appName={appDetails["name"]}
        />
      ) : null}
    </>
  );
};

export default ShareButton;
