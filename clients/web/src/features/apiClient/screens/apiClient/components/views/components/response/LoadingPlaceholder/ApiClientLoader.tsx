import React from "react";
import { PlaceholderKeyboardShortcuts } from "../../errors/PlaceholderKeyboardShortcuts/PlaceholderKeyboardShortcuts";
import { RQButton } from "lib/design-system-v2/components";
import "./ApiClientLoader.scss";
import { MdOutlineCancel } from "@react-icons/all-files/md/MdOutlineCancel";

export const ApiClientLoader: React.FC<{
  onCancelRequest: () => void;
}> = ({ onCancelRequest }) => {
  return (
    <div className="api-client-loading-view">
      <div className="empty-state">
        <img src={"/assets/media/apiClient/api-client-loader.gif"} alt="Loading response" width={96} height={96} />
        <div className="api-client-loading-view__title">Sending request and waiting for response.</div>
        <RQButton onClick={onCancelRequest} type="primary" icon={<MdOutlineCancel />}>
          Cancel request
        </RQButton>
      </div>
      <PlaceholderKeyboardShortcuts />
    </div>
  );
};
