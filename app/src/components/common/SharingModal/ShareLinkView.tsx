import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAllRules, getAppMode, getGroupwiseRulesToPopulate, getUserAuthDetails } from "store/selectors";
import { Radio, Space } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { CopyValue } from "components/misc/CopyValue";
import { createSharedList } from "components/features/sharedLists/CreateSharedListModal/actions";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { epochToDateAndTimeString } from "utils/DateTimeUtils";
import { getSharedListURL } from "utils/PathUtils";
import { toast } from "utils/Toast";
import { httpsCallable, getFunctions } from "firebase/functions";
import { CheckCircleFilled } from "@ant-design/icons";
import { SharedLinkVisibility } from "./types";
import { Rule } from "types";
import Logger from "lib/logger";
import "./index.css";

interface ShareLinkProps {
  rulesToShare: string[];
}

// TODO: handle copy changes for session replay in V1

export const ShareLinkView: React.FC<ShareLinkProps> = ({ rulesToShare }) => {
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const rules = useSelector(getAllRules);
  const groupwiseRulesToPopulate = useSelector(getGroupwiseRulesToPopulate);
  const [sharedLinkVisibility, setSharedLinkVisibility] = useState(SharedLinkVisibility.PUBLIC);
  const [permittedEmailsList, setPermittedEmailsList] = useState([]);
  const [sharedListRecipients, setSharedListRecipients] = useState([]);
  const [sharedListName, setSharedListName] = useState(null);
  const [shareableLinkData, setShareableLinkData] = useState(null);
  const [isLinkGenerating, setIsLinkGenerating] = useState(false);
  const [isMailSent, setIsMailSent] = useState(false);

  const sendSharedListShareEmail = useMemo(() => httpsCallable(getFunctions(), "sharedLists-sendShareEmail"), []);
  const singleRuleData = useMemo(
    () => (rulesToShare && rulesToShare?.length === 1 ? rules.find((rule: Rule) => rule.id === rulesToShare[0]) : null),
    [rules, rulesToShare]
  );

  const visibilityOptions = useMemo(
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
          <RQInput
            id="shared_list_name"
            style={{ flex: 1 }}
            value={sharedListName}
            onChange={(e) => setSharedListName(e.target.value)}
          />
        </div>
      </div>
    );
  }, [sharedListName]);

  const renderEmailInputField = useCallback(() => {
    return (
      <div className="mt-8 sharing-modal-email-input-wrapper">
        <label htmlFor="user_emails" className="text-gray caption">
          Email addresses
        </label>
        <ReactMultiEmail
          className="sharing-modal-email-input"
          // placeholder="john@example.com"
          //@ts-ignore
          type="email"
          emails={permittedEmailsList}
          onChange={(email) => handleAddRecipient(email)}
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
  }, [permittedEmailsList]);

  const handleAddRecipient = (recipients: string[]) => {
    setPermittedEmailsList(recipients);
    const newRecipients = recipients.map((recipient) => ({
      label: recipient,
      value: recipient,
    }));
    setSharedListRecipients(newRecipients);
  };

  const handleSharedListCreation = useCallback(() => {
    setIsMailSent(false);
    setShareableLinkData(null);

    try {
      setIsLinkGenerating(true);
      createSharedList(
        appMode,
        rulesToShare,
        sharedListName,
        groupwiseRulesToPopulate,
        sharedLinkVisibility,
        sharedListRecipients,
        user?.details?.profile?.uid
      ).then(({ sharedListId, sharedListName, sharedListData }) => {
        if (sharedLinkVisibility === SharedLinkVisibility.PRIVATE && sharedListRecipients.length) {
          sendSharedListShareEmail({
            sharedListData: sharedListData,
            recipientEmails: sharedListRecipients,
          })
            .then((res: any) => {
              if (res.data.success) setIsMailSent(true);
            })
            .catch((err) => {
              Logger.log("send shared list email failed : ", err);
              toast.error("Opps! Couldn't send the notification");
            });
        }
        setShareableLinkData({
          link: getSharedListURL(sharedListId, sharedListName),
          visibility: sharedLinkVisibility,
        });
        setIsLinkGenerating(false);
      });
    } catch (e) {
      setIsLinkGenerating(false);
    }
  }, [
    appMode,
    rulesToShare,
    sharedListName,
    groupwiseRulesToPopulate,
    sharedLinkVisibility,
    sharedListRecipients,
    user?.details?.profile?.uid,
    sendSharedListShareEmail,
  ]);

  useEffect(() => {
    if (rulesToShare) {
      if (rulesToShare.length > 1) {
        setSharedListName(`requesly_shared_list_${epochToDateAndTimeString(new Date()).split(" ")[0]}`);
      } else setSharedListName(singleRuleData.name);
    }
  }, [rulesToShare, singleRuleData]);

  return (
    <div className="sharing-modal-body">
      <Space direction="vertical" size="large" className="w-full">
        {visibilityOptions.map((option, index) => (
          <div className="w-full" key={index}>
            <Radio
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
                  {shareableLinkData && shareableLinkData.visibility === sharedLinkVisibility ? (
                    <>
                      {isMailSent && (
                        <div className="mt-8 text-gray">
                          <CheckCircleFilled className="success" /> Invites sent!
                        </div>
                      )}
                      <CopyValue value={shareableLinkData.link} />
                      {option.value === SharedLinkVisibility.PRIVATE && (
                        <div className="mt-8 text-gray caption">
                          You can also share above link for quick access, they’ll need to sign in using the email
                          address you specified.
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {renderSharedListNameField()}
                      {option.value === SharedLinkVisibility.PRIVATE && <>{renderEmailInputField()}</>}
                      <RQButton
                        type="primary"
                        className="mt-8"
                        onClick={handleSharedListCreation}
                        loading={isLinkGenerating}
                      >
                        Create list
                      </RQButton>
                    </>
                  )}
                </>
              )}
            </Radio>
          </div>
        ))}
      </Space>
    </div>
  );
};
