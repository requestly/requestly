import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast.js";
import { CheckCircleOutlined } from "@ant-design/icons";
import { AiFillInfoCircle } from "react-icons/ai";
import SpinnerColumn from "../../../../misc/SpinnerColumn";
import { getUserAuthDetails } from "store/selectors";
import { getFunctions, httpsCallable } from "firebase/functions";
import { createSharedList } from "../actions";
import * as Sentry from "@sentry/react";
import { Visibility } from "utils/sharedListUtils";
import {
  trackSharedListCreatedEvent,
  trackSharedListNotifyClicked,
} from "modules/analytics/events/features/sharedList";
import { trackRQLastActivity } from "../../../../../utils/AnalyticsUtils";
import { Typography } from "antd";
import { getSharedListURL } from "utils/PathUtils";

export const PostConfirmationModal = ({ sharedListAttributes, onSharedListCreation }) => {
  const [createdSharedListId, setCreatedSharedListId] = useState(null);
  const [sharedListPublicURL, setSharedListPublicURL] = useState("");
  const [sharedListData, setSharedListData] = useState("");
  const [sharedListCreationDone, setSharedListCreationDone] = useState(false);
  const [nonRQUserEmails, setNonRQUserEmails] = useState([]);
  const isSharedListShared = useRef(false);

  const user = useSelector(getUserAuthDetails);
  const attributes = useMemo(() => sharedListAttributes, [sharedListAttributes]);
  const rulesCount = attributes.rulesCount;
  const sharedListAccessType =
    Visibility.PUBLIC === attributes.sharedListVisibility ? "public_link" : "specific_people";

  let modalTriggerPage,
    modalTriggerSource = "";
  if (window.location.pathname.includes("my-rules")) {
    modalTriggerSource = "toolbar";
    modalTriggerPage = "rules_index";
  } else {
    modalTriggerSource = "bottom_link";
    modalTriggerPage = "editor";
  }

  const shareSharedList = useCallback(() => {
    trackSharedListNotifyClicked();
    trackRQLastActivity("sharedList_notify_button_clicked");
    const functions = getFunctions();
    const sendSharedListShareEmail = httpsCallable(functions, "sharedLists-sendSharedListShareEmail");
    sendSharedListShareEmail({
      sharedListData: sharedListData,
      recipientEmails: attributes.sharedListRecipients,
    }).catch((err) => {
      toast.error("Opps! Couldn't send the notification");
    });
  }, [attributes.sharedListRecipients, sharedListData]);

  const postCreationSteps = ({
    sharedListId,
    sharedListName,
    sharedListData,
    nonRQEmails,
    rulesCount,
    modalTriggerPage,
    modalTriggerSource,
    sharedListAccessType,
  }) => {
    const publicUrlOfList = getSharedListURL(sharedListId, sharedListName);
    setCreatedSharedListId(sharedListId);
    setSharedListPublicURL(publicUrlOfList);
    setSharedListData(sharedListData);
    setNonRQUserEmails(nonRQEmails);
    setSharedListCreationDone(true);
    onSharedListCreation(publicUrlOfList);
    trackRQLastActivity("sharedList_created");
    trackSharedListCreatedEvent(rulesCount, modalTriggerSource, modalTriggerPage, sharedListAccessType);
  };

  const stablePostCreationSteps = useCallback(postCreationSteps, [onSharedListCreation]);

  useEffect(() => {
    if (!createdSharedListId) {
      try {
        createSharedList(
          attributes.appMode,
          attributes.rulesToShare,
          attributes.sharedListName,
          attributes.groupwiseRulesToPopulate,
          attributes.sharedListVisibility,
          attributes.sharedListRecipients,
          user.details.profile.uid
        ).then(({ sharedListId, sharedListName, sharedListData, nonRQEmails }) => {
          stablePostCreationSteps({
            sharedListId,
            sharedListName,
            sharedListData,
            nonRQEmails,
            rulesCount,
            modalTriggerPage,
            modalTriggerSource,
            sharedListAccessType,
          });
        });
      } catch (e) {
        toast.error("Error creating shared list");
      }
    }
  }, [
    createdSharedListId,
    modalTriggerPage,
    modalTriggerSource,
    rulesCount,
    stablePostCreationSteps,
    sharedListAccessType,
    user.details.profile,
    attributes.appMode,
    attributes.rulesToShare,
    attributes.sharedListName,
    attributes.groupwiseRulesToPopulate,
    attributes.sharedListVisibility,
    attributes.sharedListRecipients,
  ]);

  useEffect(() => {
    if (
      !isSharedListShared.current &&
      sharedListCreationDone &&
      attributes.sharedListVisibility === "custom" &&
      attributes.sharedListRecipients.length
    ) {
      shareSharedList();
      isSharedListShared.current = true;
    }

    if (sharedListCreationDone && sharedListPublicURL.includes("null")) {
      Sentry.captureException({
        url: sharedListPublicURL,
        message: "Sharelist URL contains 'null'",
        uid: user?.details?.profile?.uid,
        rulesToShare: attributes.rulesToShare,
      });
    }
  }, [
    shareSharedList,
    attributes.rulesToShare,
    attributes.sharedListVisibility,
    attributes.sharedListRecipients,
    sharedListCreationDone,
    sharedListPublicURL,
    user?.details?.profile?.uid,
  ]);

  return (
    <div>
      {createdSharedListId ? (
        <div>
          <div
            style={{
              textAlign: "center",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              gap: "8px",
              margin: "16px 0",
            }}
          >
            <CheckCircleOutlined style={{ fontSize: "4rem", marginBottom: "8px" }} />{" "}
            <span style={{ fontSize: "1rem" }}> Successfully generated the shareable link</span>
          </div>
          <Typography align="center">
            You can view previously created links{" "}
            <a href="https://app.requestly.io/shared-lists/my-lists" target="_blank" rel="noreferrer">
              here
            </a>
          </Typography>
          {nonRQUserEmails.length ? (
            <div
              style={{
                margin: "20px 0",
                padding: "10px",
                background: "#f5f5f510",
                borderRadius: "4px",
              }}
            >
              <Typography
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  marginBottom: "8px",
                }}
              >
                <AiFillInfoCircle style={{ fontSize: "20px" }} /> We couldn't find any Requestly{" "}
                <>{nonRQUserEmails.length > 1 ? "accounts" : "account"} </>
                for the following <>{nonRQUserEmails.length > 1 ? "emails" : "email"}</>
              </Typography>
              {nonRQUserEmails.map((email) => {
                return <Typography style={{ marginLeft: "30px", fontWeight: "bold" }}>{email}</Typography>;
              })}
            </div>
          ) : null}
        </div>
      ) : (
        <SpinnerColumn />
      )}
    </div>
  );
};
