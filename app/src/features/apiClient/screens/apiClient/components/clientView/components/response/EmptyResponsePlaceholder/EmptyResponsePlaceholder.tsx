import React from "react";
import { Space } from "antd";
import { CloseCircleFilled } from "@ant-design/icons";
import { RQAPI } from "features/apiClient/types";
import LINKS from "config/constants/sub/links";
import { KEY_ICONS, KEYBOARD_SHORTCUT, KEYBOARD_SHORTCUTS } from "../../../../../../../../../constants";
import { capitalize } from "lodash";
import { MdOutlineOpenInNew } from "@react-icons/all-files/md/MdOutlineOpenInNew";
import "./emptyResponsePlaceholder.scss";

const KeyboardShortcut: React.FC<KEYBOARD_SHORTCUT> = ({ hotKey, description }) => {
  return (
    <div className="keyboard-shortcut">
      <div className="description">{description}</div>
      <div className="keys-container">
        {hotKey.split("+").map((key) => (
          <span className="key">{KEY_ICONS[key] ?? capitalize(key)}</span>
        ))}
      </div>
    </div>
  );
};

interface EmptyResponseViewProps {
  isFailed: boolean;
  emptyDescription: string;
  error?: RQAPI.ExecutionError;
}
export const EmptyResponsePlaceholder: React.FC<EmptyResponseViewProps> = ({ isFailed, emptyDescription, error }) => {
  return (
    <>
      <div className="api-client-empty-response-view">
        {isFailed ? (
          <Space>
            <CloseCircleFilled style={{ color: "#ff4d4f" }} />
            {error
              ? `Error while executing the ${error.source} - ${error.name}: ${error.message}`
              : "Failed to send the request. Please check if the URL is valid or check the console for error."}
          </Space>
        ) : (
          <>
            <div className="empty-state">
              <img src={"/media/apiClient/response-empty-state.svg"} alt="empty card" width={80} height={80} />
              <div className="api-client-empty-response-view__title">Nothing to see here!</div>
              <div className="api-client-empty-response-view__description">{emptyDescription}</div>
            </div>

            <div className="keyboard-shortcuts">
              <KeyboardShortcut {...KEYBOARD_SHORTCUTS.API_CLIENT.SAVE_REQUEST} />
              <KeyboardShortcut {...KEYBOARD_SHORTCUTS.API_CLIENT.SEND_REQUEST} />
            </div>

            <a className="documentation-link" href={LINKS.REQUESTLY_API_CLIENT_DOCS} target="_blank" rel="noreferrer">
              <span>Read documentation</span> <MdOutlineOpenInNew />
            </a>
          </>
        )}
      </div>
    </>
  );
};
