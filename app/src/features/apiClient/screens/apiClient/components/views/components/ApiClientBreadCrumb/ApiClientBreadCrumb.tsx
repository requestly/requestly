import React from "react";
import { Conditional } from "components/common/Conditional";
import PATHS from "config/constants/sub/paths";
import { RQBreadcrumb } from "lib/design-system-v2/components";
import { useLocation } from "react-router-dom";

interface Props {
  openInModal?: boolean;
  autoFocus?: boolean;
  name?: string;
  OnRecordNameUpdate: (name: string) => void;
  onBlur: (name: string) => void;
}

export const ApiClientBreadCrumb: React.FC<Props> = ({ openInModal, autoFocus, name, OnRecordNameUpdate, onBlur }) => {
  const location = useLocation();
  const isHistoryPath = location.pathname.includes("history");

  return (
    <Conditional condition={!openInModal}>
      <RQBreadcrumb
        placeholder="Untitled request"
        recordName={name}
        onRecordNameUpdate={OnRecordNameUpdate}
        onBlur={onBlur}
        autoFocus={autoFocus}
        defaultBreadcrumbs={[
          { label: "API Client", pathname: PATHS.API_CLIENT.INDEX },
          {
            isEditable: !isHistoryPath,
            pathname: window.location.pathname,
            label: isHistoryPath ? "History" : name || "Untitled request",
          },
        ]}
      />
    </Conditional>
  );
};
