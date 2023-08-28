import React, { useCallback, useMemo, useState } from "react";
import { Radio, Space } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { SharedLinkVisibility } from "../types";
import "../index.css";

export const ShareLinkView: React.FC = () => {
  const [sharedLinkVisibility, setSharedLinkVisibility] = useState(SharedLinkVisibility.PUBLIC);
  const [userEmails, setUserEmails] = useState([]);
  // const [sharedListName, setSharedListName] = useState(null);

  const visibilityOptions = useMemo(
    // TODO: handle labels and description for session replay in V1
    () => [
      {
        label: "Public shared list",
        value: SharedLinkVisibility.PUBLIC,
        description: "Anyone with a link can access the rule.",
      },
      {
        label: "Private shared list",
        value: SharedLinkVisibility.PRIVATE,
        description: "Only accessible only by accounts you specify.",
      },
    ],
    []
  );

  const renderSharedListNameField = useCallback(() => {
    return (
      <div className="w-full mt-8">
        <label htmlFor="shared_list_name" className="text-gray caption">
          List name
        </label>
        <div className="shared-list-name-input-wrapper">
          <RQInput id="shared_list_name" style={{ flex: 1 }} />
        </div>
      </div>
    );
  }, [sharedLinkVisibility]);

  const renderEmailInputField = useCallback(() => {
    return (
      <div className="mt-16 sharing-modal-email-input-wrapper">
        <label htmlFor="user_emails" className="text-gray caption">
          Email addresses
        </label>
        <ReactMultiEmail
          className="sharing-modal-email-input"
          // placeholder="john@requestly.io"
          //@ts-ignore
          type="email"
          value={userEmails}
          onChange={setUserEmails}
          validateEmail={validateEmail}
          getLabel={(email, index, removeEmail) => (
            <div data-tag key={index} className="multi-email-tag">
              {email}
              <span title="Remove" data-tag-handle onClick={() => removeEmail(index)}>
                <img alt="remove" src="/assets/img/workspaces/cross.svg" />
              </span>
            </div>
          )}
        />
      </div>
    );
  }, [userEmails]);

  return (
    <div className="sharing-modal-body">
      <Space direction="vertical" size="large" className="w-full">
        {visibilityOptions.map((option, index) => (
          <div className="w-full">
            <Radio
              key={index}
              value={option.value}
              checked={sharedLinkVisibility === option.value}
              onChange={() => setSharedLinkVisibility(option.value)}
              className="w-full"
            >
              <div className="share-link-radio-btn-label">
                <div className="text-white text-bold">{option.label}</div>
                <div className="text-gray">{option.description}</div>
              </div>
              {option.value === sharedLinkVisibility && (
                <>
                  {renderSharedListNameField()}
                  {option.value === SharedLinkVisibility.PRIVATE && <>{renderEmailInputField()}</>}
                  <RQButton type="primary" className="mt-8">
                    Create list
                  </RQButton>
                </>
              )}
            </Radio>
          </div>
        ))}
      </Space>
    </div>
  );
};
