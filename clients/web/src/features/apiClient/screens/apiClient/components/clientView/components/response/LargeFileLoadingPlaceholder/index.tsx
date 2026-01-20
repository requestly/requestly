import React from "react";
import { PlaceholderKeyboardShortcuts } from "../../../../views/components/errors/PlaceholderKeyboardShortcuts/PlaceholderKeyboardShortcuts";
import { RQButton } from "lib/design-system-v2/components";
import "./index.scss";
import { MdOutlineCancel } from "@react-icons/all-files/md/MdOutlineCancel";

export const ApiClientLargeFileLoader: React.FC<{
  onCancelRequest: () => void;
}> = ({ onCancelRequest }) => {
  return (
    <div className="api-client-loading-view">
      <div className="empty-state">
        <img src={"/assets/media/apiClient/api-client-loader.gif"} alt="Loading response" width={96} height={96} />
        <div className="api-client-loading-view__title">Uploading a large file — this may take a moment.</div>
        <div className="api-client-loading-message">
          Large files (100MB+) can take longer to upload and receive a response. Thanks for your patience.
        </div>
        <RQButton onClick={onCancelRequest} type="primary" icon={<MdOutlineCancel />}>
          Cancel request
        </RQButton>
      </div>
      <PlaceholderKeyboardShortcuts />
    </div>
  );
};
