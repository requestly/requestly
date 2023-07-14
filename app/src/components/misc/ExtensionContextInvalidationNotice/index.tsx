import React, { useEffect, useState } from "react";
import { Typography } from "antd";
import { trackExtensionContextInvalidated } from "modules/analytics/events/misc/extensionContextInvalidation";
import PageScriptMessageHandler from "config/PageScriptMessageHandler";
// @ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./extensionContextInvalidationNotice.scss";

const ExtensionContextInvalidationNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    PageScriptMessageHandler.addMessageListener(
      GLOBAL_CONSTANTS.EXTENSION_MESSAGES.NOTIFY_EXTENSION_UPDATED,
      ({ oldVersion, newVersion }: { oldVersion: string; newVersion: string }) => {
        setVisible(true);
        trackExtensionContextInvalidated(oldVersion, newVersion);
      }
    );
  }, []);

  return visible ? (
    <div id="extension-context-invalidation-notice">
      <Typography.Text>
        The browser extension was updated in the background. Please save your work and&nbsp;
      </Typography.Text>
      <Typography.Link onClick={() => window.location.reload()}>Reload</Typography.Link>
      <Typography.Text>&nbsp;the page to avoid errors.</Typography.Text>
    </div>
  ) : null;
};

export default ExtensionContextInvalidationNotice;
