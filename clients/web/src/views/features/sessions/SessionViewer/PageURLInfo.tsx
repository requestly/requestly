import React, { useMemo } from "react";
import { PageNavigationLog } from "./types";
import { Input } from "antd";
import CopyButton from "components/misc/CopyButton";

interface Props {
  sessionUrl: string;
  logs: PageNavigationLog[];
  playerTimeOffset: number;
}

const PageURLInfo: React.FC<Props> = ({ sessionUrl, logs, playerTimeOffset }) => {
  const currentUrl = useMemo<string>(() => {
    // Not using Array.findLast() as it is not widely supported yet
    let logIndex = 0;

    while (logIndex < logs.length && logs[logIndex].timeOffset <= playerTimeOffset) {
      logIndex++;
    }

    if (logIndex === 0) {
      return sessionUrl;
    }

    return logs[logIndex - 1].href;
  }, [sessionUrl, logs, playerTimeOffset]);

  return currentUrl ? (
    <Input
      readOnly
      addonBefore="Page URL"
      value={currentUrl}
      className="session-page-url-property"
      suffix={<CopyButton showIcon={true} copyText={currentUrl} title={null} />}
    />
  ) : null;
};

export default PageURLInfo;
