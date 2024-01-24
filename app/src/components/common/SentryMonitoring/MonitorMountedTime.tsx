import React, { useEffect } from "react";
import { startTransaction } from "@sentry/react";

interface MonitorMountedTimeProps {
  transactionName: string;
}

const MonitorMountedTime: React.FC<MonitorMountedTimeProps> = (props) => {
  useEffect(() => {
    const transaction = startTransaction({
      name: props.transactionName,
      op: "Monitoring component shown",
    });
    return () => {
      transaction.finish();
    };
  }, [props.transactionName]);
  return null;
};

export default MonitorMountedTime;
