import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { Radio, Space, Tooltip } from "antd";
import { RQButton, RQInput } from "lib/design-system/components";
import { CopyValue } from "components/misc/CopyValue";
import { getSharedListIdFromImportURL } from "features/rules/screens/sharedLists";
import { createSharedList } from "./actions";
import { getFormattedDate } from "utils/DateTimeUtils";
import { getSharedListURL } from "utils/PathUtils";
import { toast } from "utils/Toast";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
import { httpsCallable, getFunctions } from "firebase/functions";
import { AiFillCheckCircle } from "@react-icons/all-files/ai/AiFillCheckCircle";
import { AiOutlineInfoCircle } from "@react-icons/all-files/ai/AiOutlineInfoCircle";
import { FaSpinner } from "@react-icons/all-files/fa/FaSpinner";
import { SharedLinkVisibility } from "./types";
import Logger from "lib/logger";
import { getAllRecords } from "store/features/rules/selectors";
import { trackSharedListCreatedEvent } from "modules/analytics/events/features/sharedList";
import { trackSharedListUrlCopied } from "features/rules/screens/sharedLists";
import EmailInputWithDomainBasedSuggestions from "../EmailInputWithDomainBasedSuggestions";
import { useLocation } from "react-router-dom";
import PATHS from "config/constants/sub/paths";
import "./index.css";
import { StorageRecord } from "@requestly/shared/types/entities/rules";

interface ShareLinkProps {
  selectedRules: StorageRecord["id"][];
  source: string;
  onSharedLinkCreated?: () => void;
}

// TODO: handle copy changes for session replay in V1

export const ShareLinkView: React.FC<ShareLinkProps> = ({ selectedRules, source, onSharedLinkCreated = () => {} }) => {
  const location = useLocation();
  const appMode = useSelector(getAppMode);
  const records = useSelector(getAllRecords);
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const [sharedLinkVisibility, setSharedLinkVisibility] = useState(SharedLinkVisibility.PUBLIC);
  const [sharedListRecipients, setSharedListRecipients] = useState([]);
  const [sharedListName, setSharedListName] = useState(null);
  const [shareableLinkData, setShareableLinkData] = useState(null);
  const [isLinkGenerating, setIsLinkGenerating] = useState(false);
  const [isMailSent, setIsMailSent] = useState(false);
  const [error, setError] = useState(null);
  const isRuleEditor = location?.pathname.includes(PATHS.RULE_EDITOR.RELATIVE);

  const sendSharedListShareEmail = useMemo(() => httpsCallable(getFunctions(), "sharedLists-sendShareEmail"), []);
  const singleRuleData = useMemo(() => {
    if (isRuleEditor) {
      return currentlySelectedRuleData;
    }

    return selectedRules && selectedRules?.length === 1
      ? records.find((record) => record.id === selectedRules[0])
      : null;
  }, [records, selectedRules, isRuleEditor, currentlySelectedRuleData?.name]);

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

  const handleAddRecipient = useCallback((recipients: string[]) => {
    const newRecipients = recipients.map((recipient) => ({
      label: recipient,
      value: recipient,
    }));
    setSharedListRecipients(newRecipients);
  }, []);

  const validateSharedListName = useCallback(() => {
    //eslint-disable-next-line
    const specialCharacters = /[`!@#$%^&*()+\=\[\]{};':"\\|,.<>\/?~]/;
    return specialCharacters.test(sharedListName);
  }, [sharedListName]);

  const handleSharedListCreation = useCallback(() => {
    const isSharedListNameNotValid = validateSharedListName();

    if (!sharedListName) {
      if (sharedLinkVisibility === SharedLinkVisibility.PRIVATE) {
        setError("Shared list name cannot be empty");
      }

      return;
    }

    if (sharedLinkVisibility === SharedLinkVisibility.PRIVATE && isSharedListNameNotValid) {
      setError("Shared list name cannot have special characters");
      return;
    }
    setIsMailSent(false);
    setShareableLinkData(null);
    setError(null);

    try {
      setIsLinkGenerating(true);
      createSharedList(appMode, selectedRules, sharedListName, sharedLinkVisibility, sharedListRecipients).then(
        ({ sharedListId, sharedListName, sharedListData, nonRQEmails }: any) => {
          trackRQLastActivity("sharedList_created");
          onSharedLinkCreated();
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

          const shareableLinkData = {
            link: getSharedListURL(sharedListId, sharedListName),
            visibility: sharedLinkVisibility,
          };

          setShareableLinkData(shareableLinkData);

          navigator.clipboard.writeText(shareableLinkData.link).catch((e) => {
            // NOOP
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
        }
      );
    } catch (e) {
      setIsLinkGenerating(false);
    }
  }, [
    appMode,
    source,
    onSharedLinkCreated,
    selectedRules,
    sharedListName,
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

  useEffect(() => {
    if (
      shareableLinkData?.visibility !== SharedLinkVisibility.PUBLIC &&
      sharedLinkVisibility === SharedLinkVisibility.PUBLIC
    ) {
      handleSharedListCreation();
    }
  }, [shareableLinkData?.visibility, sharedLinkVisibility, handleSharedListCreation]);

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
            </Radio>
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
                    ) : null}
                    <CopyValue
                      title="Copy link"
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
                        You can also share above link for quick access, they’ll need to sign in using the email address
                        you specified.
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    {option.value === SharedLinkVisibility.PUBLIC && isLinkGenerating ? (
                      <div className="link-generation-loader">
                        <FaSpinner className="icon-spin" /> <span>Generating a sharing link...</span>
                      </div>
                    ) : null}

                    {option.value === SharedLinkVisibility.PRIVATE && (
                      <>
                        {sharedListNameField}

                        <div className="mt-8 sharing-modal-email-input-wrapper">
                          <label htmlFor="user_emails" className="text-gray caption">
                            Email addresses
                          </label>
                          <EmailInputWithDomainBasedSuggestions onChange={handleAddRecipient} />
                        </div>

                        <RQButton
                          type="primary"
                          className="mt-8"
                          onClick={handleSharedListCreation}
                          disabled={!sharedListRecipients.length}
                          loading={isLinkGenerating}
                        >
                          Create list
                        </RQButton>
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        ))}
      </Space>
    </div>
  );
};
