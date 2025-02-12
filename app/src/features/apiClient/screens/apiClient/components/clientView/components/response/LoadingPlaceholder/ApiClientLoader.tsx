import React from "react";
import { PlaceholderKeyboardShortcuts } from "../../errors/PlaceholderKeyboardShortcuts/PlaceholderKeyboardShortcuts";
import { RQButton } from "lib/design-system-v2/components";
import "./ApiClientLoader.scss";

export const ApiClientLoader: React.FC<{
  onCancelRequest: () => void;
}> = () => {
  return (
    <div className="api-client-loading-view">
      <div className="empty-state">
        <img src={"/assets/media/apiClient/api-client-loader.gif"} alt="Loading response" width={80} height={80} />
        <div className="api-client-empty-response-view__title">Sending request and waiting for response.</div>
        <RQButton>Cancel request</RQButton>
      </div>
      <PlaceholderKeyboardShortcuts />
    </div>
  );
};
