import React from "react";
import { Alert, Button } from "antd";
import { redirectToDownloadPage } from "utils/RedirectionUtils";

const ExtensionUpgradeAlert = () => {
  // This is only meant to be shown when the user
  // does not have extension installed and
  // is viewing recordings inside team workspace

  return (
    <React.Fragment>
      <Alert
        message="You need to download Requestly extension to record sessions."
        type="warning"
        showIcon
        closable
        action={
          <Button type="primary" onClick={redirectToDownloadPage}>
            Get latest extension
          </Button>
        }
      />
    </React.Fragment>
  );
};

export default ExtensionUpgradeAlert;
