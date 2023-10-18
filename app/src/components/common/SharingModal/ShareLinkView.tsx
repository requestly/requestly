import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAllRules, getAppMode, getGroupwiseRulesToPopulate } from "store/selectors";
import { Radio, Space, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { CopyValue } from "components/misc/CopyValue";
import { getSharedListIdFromImportURL } from "components/features/sharedLists/SharedListViewerIndexPage/actions";
import { createSharedList } from "./actions";
import { ReactMultiEmail, isEmail as validateEmail } from "react-multi-email";
import { getFormattedDate } from "utils/DateTimeUtils";
import { getSharedListURL } from "utils/PathUtils";
import { toast } from "utils/Toast";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { httpsCallable, getFunctions } from "firebase/functions";
import { AiFillCheckCircle } from "@react-icons/all-files/ai/AiFillCheckCircle";
import { AiOutlineInfoCircle } from "@react-icons/all-files/ai/AiOutlineInfoCircle";
import { SharedLinkVisibility } from "./types";
import { Rule } from "types";
import Logger from "lib/logger";
import { trackSharedListCreatedEvent, trackSharedListUrlCopied } from "modules/analytics/events/features/sharedList";
import "./index.css";

interface ShareLinkProps {
  selectedRules: string[];
  source: string;
}

// TODO: handle copy changes for session replay in V1

export const ShareLinkView: React.FC<ShareLinkProps> = ({ selectedRules, source }) => {
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
  const [error, setError] = useState(null);

  const sendSharedListShareEmail = useMemo(() => httpsCallable(getFunctions(), "sharedLists-sendShareEmail"), []);
  const singleRuleData = useMemo(
    () =>
      selectedRules && selectedRules?.length === 1 ? rules.find((rule: Rule) => rule.id === selectedRules[0]) : null,
    [rules, selectedRules]
  );

  const visibilityOptions = useMemo(
    () => [
      {
        label: (
          <span>
            Public shared list{" "}
            <Tooltip
              showArrow={false}
              placement="bottom"
              overlayClassName="share-link-radio-btn-label-tooltip"
              title="Anyone with the link can access the rule."
            >
              <AiOutlineInfoCircle className="text-gray" />
            </Tooltip>
          </span>
        ),
        value: SharedLinkVisibility.PUBLIC,
      },
      {
        label: (
          <span>
            Private shared list{" "}
            <Tooltip
              showArrow={false}
              placement="bottom"
              overlayClassName="share-link-radio-btn-label-tooltip"
              title="Only accessible by accounts you specify."
            >
              <AiOutlineInfoCircle className="text-gray" />
            </Tooltip>
          </span>
        ),
        value: SharedLinkVisibility.PRIVATE,
      },
    ],
    []
  );

  const sharedListNameField = (
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
          status={error ? "error" : ""}
        />
      </div>
      <div className="caption danger">{error}</div>
    </div>
  );

  const emailInputField = useMemo(
    () => (
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
    ),
    [permittedEmailsList]
  );

  const handleAddRecipient = (recipients: string[]) => {
    setPermittedEmailsList(recipients);
    const newRecipients = recipients.map((recipient) => ({
      label: recipient,
      value: recipient,
    }));
    setSharedListRecipients(newRecipients);
  };

  const validateSharedListName = useCallback(() => {
    //eslint-disable-next-line
    const specialCharacters = /[`!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
    return specialCharacters.test(sharedListName);
  }, [sharedListName]);

  const handleSharedListCreation = useCallback(() => {
    const isSharedListNameNotValid = validateSharedListName();
    if (!sharedListName) {
      setError("Shared list name cannot be empty");
      return;
    }
    if (isSharedListNameNotValid) {
      setError("Shared list name cannot have special characters");
      return;
    }
    setIsMailSent(false);
    setShareableLinkData(null);
    setError(null);

    try {
      setIsLinkGenerating(true);
      createSharedList(
        appMode,
        selectedRules,
        sharedListName,
        groupwiseRulesToPopulate,
        sharedLinkVisibility,
        sharedListRecipients
      ).then(({ sharedListId, sharedListName, sharedListData, nonRQEmails }: any) => {
        trackRQLastActivity("sharedList_created");
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

        const nonRQEmailsCount = sharedLinkVisibility === SharedLinkVisibility.PRIVATE ? nonRQEmails?.length : null;
        const recipientsCount =
          sharedLinkVisibility === SharedLinkVisibility.PRIVATE ? sharedListRecipients.length : null;

        trackSharedListCreatedEvent(
          sharedListId,
          sharedListName,
          selectedRules.length,
          source,
          sharedLinkVisibility,
          nonRQEmailsCount,
          recipientsCount
        );
        setIsLinkGenerating(false);
      });
    } catch (e) {
      setIsLinkGenerating(false);
    }
  }, [
    appMode,
    source,
    selectedRules,
    sharedListName,
    groupwiseRulesToPopulate,
    sharedLinkVisibility,
    sharedListRecipients,
    sendSharedListShareEmail,
    validateSharedListName,
  ]);

  useEffect(() => {
    if (!selectedRules?.length) return;

    if (selectedRules.length > 1) setSharedListName(`requestly_shared_list_${getFormattedDate("DD_MM_YYYY")}`);
    else setSharedListName(singleRuleData?.name);
  }, [selectedRules?.length, singleRuleData?.name]);

  return (
    <div className="sharing-modal-body">
      <Space direction="vertical" size={12} className="w-full">
        {visibilityOptions.map((option, index) => (
          <div className="w-full" key={index}>
            <Radio
              value={option.value}
              checked={sharedLinkVisibility === option.value}
              onChange={() => setSharedLinkVisibility(option.value)}
              className="w-full"
            >
              <div className="text-white text-bold share-link-radio-btn-label">{option.label}</div>

              {option.value === sharedLinkVisibility && (
                <>
                  {shareableLinkData && shareableLinkData.visibility === sharedLinkVisibility ? (
                    <>
                      {shareableLinkData.visibility === SharedLinkVisibility.PRIVATE ? (
                        <>
                          {isMailSent && (
                            <div className="mt-8 text-gray success-message">
                              <AiFillCheckCircle className="success" /> Invites sent!
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="mt-8 text-gray success-message">
                          <AiFillCheckCircle className="success" /> Shared list created
                        </div>
                      )}
                      <CopyValue
                        value={shareableLinkData.link}
                        trackCopiedEvent={() =>
                          trackSharedListUrlCopied(
                            source,
                            getSharedListIdFromImportURL(shareableLinkData.link),
                            sharedLinkVisibility
                          )
                        }
                      />
                      {option.value === SharedLinkVisibility.PRIVATE && (
                        <div className="mt-8 text-gray caption">
                          You can also share above link for quick access, they’ll need to sign in using the email
                          address you specified.
                        </div>
                      )}
                    </>
                  ) : (
                    <>
                      {sharedListNameField}
                      {option.value === SharedLinkVisibility.PRIVATE && <>{emailInputField}</>}
                      <RQButton
                        type="primary"
                        className="mt-8"
                        onClick={handleSharedListCreation}
                        disabled={sharedLinkVisibility === SharedLinkVisibility.PRIVATE && !sharedListRecipients.length}
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
