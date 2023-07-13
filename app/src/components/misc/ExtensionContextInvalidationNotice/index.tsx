import React, { useEffect, useState } from "react";
import { Typography } from "antd";
import { trackExtensionContextInvalidated } from "modules/analytics/events/misc/extensionContextInvalidation";
import "./extensionContextInvalidationNotice.scss";

const ExtensionContextInvalidationNotice: React.FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    window.addEventListener("message", (event) => {
      if (event.data?.event === "requestly:extensionUpdated") {
        setVisible(true);
        trackExtensionContextInvalidated(event.data.oldVersion, event.data.newVersion);
      }
    });
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
