import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { getAppMode, getCurrentlySelectedRuleData } from "store/selectors";
import { Radio, RadioChangeEvent, Tooltip } from "antd";
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
import { StorageRecord } from "@requestly/shared/types/entities/rules";
import { NotifyOnImport } from "./components/NotifyOnImport/NotifyOnImport";
import { copyToClipBoard } from "utils/Misc";
import "./index.css";

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
  const [sharedListId, setSharedListId] = useState<string>("");
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

    //eslint-disable-next-line
  }, [records, selectedRules, isRuleEditor, currentlySelectedRuleData?.name]);

  const visibilityOptions = useMemo(
    () => [
      {
        label: (
          <>
            <span>Public shared list</span>{" "}
            <Tooltip
              showArrow={false}
              placement="bottom"
              overlayClassName="share-link-radio-btn-label-tooltip"
              title="Anyone with the link can access the rule."
            >
              <AiOutlineInfoCircle />
            </Tooltip>
          </>
        ),
        value: SharedLinkVisibility.PUBLIC,
      },
      {
        label: (
          <>
            <span>Private shared list</span>{" "}
            <Tooltip
              showArrow={false}
              placement="bottom"
              overlayClassName="share-link-radio-btn-label-tooltip"
              title="Only accessible by accounts you specify."
            >
              <AiOutlineInfoCircle />
            </Tooltip>
          </>
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
      createSharedList({
        appMode,
        rulesIdsToShare: selectedRules,
        sharedListName,
        sharedListVisibility: sharedLinkVisibility,
        sharedListRecipients,
        notifyOnImport: false,
      }).then(({ sharedListId, sharedListName, sharedListData, nonRQEmails }: any) => {
        trackRQLastActivity("sharedList_created");
        onSharedLinkCreated();
        setSharedListId(sharedListId);
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

        copyToClipBoard(shareableLinkData.link);

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

  const handleSharedListVisibilityChange = (e: RadioChangeEvent) => {
    const value = e.target.value as SharedLinkVisibility;
    setSharedLinkVisibility(value);

    if (value === SharedLinkVisibility.PRIVATE) {
      // reset
      setShareableLinkData(null);
      setSharedListRecipients([]);
    }
  };

  return (
    <div className="sharing-modal-body">
      <div className="shared-list-container">
        <div className="shared-list-visibility-options">
          {visibilityOptions.map((option) => {
            return (
              <Radio
                value={option.value}
                checked={sharedLinkVisibility === option.value}
                onChange={handleSharedListVisibilityChange}
                className="text-white text-bold share-link-radio-btn-label"
              >
                {option.label}
              </Radio>
            );
          })}
        </div>

        <>
          {shareableLinkData && shareableLinkData.visibility === sharedLinkVisibility ? (
            <>
              {shareableLinkData.visibility === SharedLinkVisibility.PRIVATE ? (
                <>
                  {isMailSent && (
                    <div className="mt-8 text-gray success-message">
                      <AiFillCheckCircle className="success" /> <span>Invites sent!</span>
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
              {sharedLinkVisibility === SharedLinkVisibility.PRIVATE && (
                <div className="mt-8 text-gray caption">
                  You can also share above link for quick access, they’ll need to sign in using the email address you
                  specified.
                </div>
              )}
            </>
          ) : (
            <>
              {sharedLinkVisibility === SharedLinkVisibility.PUBLIC && isLinkGenerating ? (
                <div className="link-generation-loader">
                  <FaSpinner className="icon-spin" /> <span>Generating a sharing link...</span>
                </div>
              ) : null}

              {sharedLinkVisibility === SharedLinkVisibility.PRIVATE && (
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

        <NotifyOnImport
          key={sharedListId}
          sharedListId={sharedListId}
          disabled={isLinkGenerating || !shareableLinkData}
          label="Enable email notification for shared list import"
        />
      </div>
    </div>
  );
};
