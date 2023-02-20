import { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "utils/Toast.js";
import { CheckCircleOutlined } from "@ant-design/icons";
import { AiFillInfoCircle } from "react-icons/ai";
import SpinnerColumn from "../../../../misc/SpinnerColumn";

import { getUserAuthDetails } from "store/selectors";

import { getFunctions, httpsCallable } from "firebase/functions";
import { createSharedList } from "../actions";

import * as Sentry from "@sentry/react";
import {
  trackSharedListCreatedEvent,
  trackSharedListNotifyClicked,
} from "modules/analytics/events/features/sharedList";
import { trackRQLastActivity } from "../../../../../utils/AnalyticsUtils";

import { Typography } from "antd";
import { getSharedListURL } from "utils/PathUtils";

export const PostConfirmationModal = ({
  sharedListAttributes,
  onSharedListCreation,
}) => {
  const [createdSharedListId, setCreatedSharedListId] = useState(null);
  const [sharedListPublicURL, setSharedListPublicURL] = useState("");
  const [sharedListData, setSharedListData] = useState("");
  const [sharedListCreationDone, setSharedListCreationDone] = useState(false);
  const [nonRQUserEmails, setNonRQUserEmails] = useState([]);

  const user = useSelector(getUserAuthDetails);
  const rulesCount = sharedListAttributes.rulesCount;

  let modalTriggerPage,
    modalTriggerSource = "";
  if (window.location.pathname.includes("my-rules")) {
    modalTriggerSource = "toolbar";
    modalTriggerPage = "rules_index";
  } else {
    modalTriggerSource = "bottom_link";
    modalTriggerPage = "editor";
  }

  const renderLoader = () => (
    <>
      <SpinnerColumn />
    </>
  );

  const shareSharedList = useCallback(() => {
    trackSharedListNotifyClicked();
    trackRQLastActivity("sharedList_notify_button_clicked");
    const functions = getFunctions();
    const sendSharedListShareEmail = httpsCallable(
      functions,
      "sendSharedListShareEmail"
    );

    sendSharedListShareEmail({
      sharedListData: sharedListData,
      recipientEmails: sharedListAttributes.sharedListRecipients,
    }).catch((err) => {
      toast.error("Opps! Couldn't send the notification");
    });
  }, [sharedListAttributes.sharedListRecipients, sharedListData]);

  const postCreationSteps = (
    sharedListId,
    sharedListName,
    sharedListData,
    nonRQEmails,
    rulesCount,
    modalTriggerPage,
    modalTriggerSource
  ) => {
    const publicUrlOfList = getSharedListURL(sharedListId, sharedListName);
    setCreatedSharedListId(sharedListId);
    setSharedListPublicURL(publicUrlOfList);
    setSharedListData(sharedListData);
    setNonRQUserEmails(nonRQEmails);
    setSharedListCreationDone(true);
    onSharedListCreation(publicUrlOfList);
    trackRQLastActivity("sharedList_created");
    trackSharedListCreatedEvent(
      rulesCount,
      modalTriggerSource,
      modalTriggerPage
    );
  };

  const stablePostCreationSteps = useCallback(postCreationSteps, [
    onSharedListCreation,
  ]);

  useEffect(() => {
    if (!createdSharedListId) {
      try {
        createSharedList(
          sharedListAttributes.appMode,
          sharedListAttributes.rulesToShare,
          sharedListAttributes.sharedListName,
          sharedListAttributes.groupwiseRulesToPopulate,
          sharedListAttributes.sharedListVisibility,
          sharedListAttributes.sharedListRecipients,
          user.details.profile.uid
        ).then(
          ({ sharedListId, sharedListName, sharedListData, nonRQEmails }) => {
            stablePostCreationSteps(
              sharedListId,
              sharedListName,
              sharedListData,
              nonRQEmails,
              rulesCount,
              modalTriggerPage,
              modalTriggerSource
            );
          }
        );
      } catch (e) {
        toast.error("Error creating shared list");
      }
    }
  }, [
    createdSharedListId,
    modalTriggerPage,
    modalTriggerSource,
    rulesCount,
    sharedListAttributes,
    stablePostCreationSteps,
    user.details.profile,
  ]);

  useEffect(() => {
    if (
      sharedListCreationDone &&
      sharedListAttributes.sharedListVisibility === "custom" &&
      sharedListAttributes.sharedListRecipients.length
    ) {
      shareSharedList();
    }

    if (sharedListCreationDone && sharedListPublicURL.includes("null")) {
      Sentry.captureException({
        url: sharedListPublicURL,
        message: "Sharelist URL contains 'null'",
        uid: user?.details?.profile?.uid,
        rulesToShare: sharedListAttributes.rulesToShare,
      });
    }
  }, [
    shareSharedList,
    sharedListAttributes,
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
            <CheckCircleOutlined
              style={{ fontSize: "4rem", marginBottom: "8px" }}
            />{" "}
            <span style={{ fontSize: "1rem" }}>
              {" "}
              Successfully generated the shareable link
            </span>
          </div>
          <Typography align="center">
            You can view previously created links{" "}
            <a
              href="https://app.requestly.io/shared-lists/my-lists"
              target="_blank"
              rel="noreferrer"
            >
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
                <AiFillInfoCircle style={{ fontSize: "20px" }} /> We couldn't
                find any Requestly{" "}
                <>{nonRQUserEmails.length > 1 ? "accounts" : "account"} </>
                for the following{" "}
                <>{nonRQUserEmails.length > 1 ? "emails" : "email"}</>
              </Typography>
              {nonRQUserEmails.map((email) => {
                return (
                  <Typography
                    style={{ marginLeft: "30px", fontWeight: "bold" }}
                  >
                    {email}
                  </Typography>
                );
              })}
            </div>
          ) : null}
        </div>
      ) : (
        renderLoader()
      )}
    </div>
  );
};
