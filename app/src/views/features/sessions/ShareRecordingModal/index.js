import React, { useEffect, useState, useRef, useCallback } from "react";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Button, Col, Row, Radio, Tag, Typography, Modal } from "antd";
import EmailInputWithDomainBasedSuggestions from "components/common/EmailInputWithDomainBasedSuggestions";
import { BsBuilding } from "@react-icons/all-files/bs/BsBuilding";
import { AiOutlineLink } from "@react-icons/all-files/ai/AiOutlineLink";
import { getSessionRecordingSharedLink } from "utils/PathUtils";
import { ShareAltOutlined } from "@ant-design/icons";
import { IoEarthOutline } from "@react-icons/all-files/io5/IoEarthOutline";
import firebaseApp from "../../../../firebase";
import { FiLock } from "@react-icons/all-files/fi/FiLock";
import { FiUsers } from "@react-icons/all-files/fi/FiUsers";
import SpinnerColumn from "components/misc/SpinnerColumn";
import { trackSessionRecordingShareLinkCopied } from "features/sessionBook/analytics";
import { trackIframeEmbedCopied } from "modules/analytics/events/features/sessionRecording";
import { getFunctions, httpsCallable } from "firebase/functions";
import { fetchCurrentEmails, updateVisibility } from "../api";
import { Visibility } from "../SessionViewer/types";
import { useSelector } from "react-redux";
import { StartFromOffsetInput } from "./components/StartFromOffsetInput/StartFromOffsetInput";
import { getSecondsFromStringifiedMinSec } from "utils/DateTimeUtils";
import "./shareRecordingModal.scss";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { copyToClipBoard } from "utils/Misc";

const _ = require("lodash");

export const renderHeroIcon = (currentVisibility, size = 16) => {
  switch (currentVisibility) {
    default:
    case Visibility.PUBLIC:
      return <IoEarthOutline size={size} className="radio-hero-icon" />;

    case Visibility.CUSTOM:
      return <FiUsers size={size} className="radio-hero-icon" />;

    case Visibility.ONLY_ME:
      return <FiLock size={size} className="radio-hero-icon" />;

    case Visibility.ORGANIZATION:
      return <BsBuilding size={size} className="radio-hero-icon" />;
  }
};

export const getPrettyVisibilityName = (visibility, isWorkspaceMode) => {
  switch (visibility) {
    case Visibility.ONLY_ME:
      return isWorkspaceMode ? "Private to current workspace" : "Private to me";
    case Visibility.PUBLIC:
      return "Anyone with the link";
    case Visibility.CUSTOM:
      return isWorkspaceMode ? "Only with specific people outside this workspace" : "Only with specific people";
    case Visibility.ORGANIZATION:
      return "All members of my organization";

    default:
      return visibility;
  }
};

const ShareRecordingModal = ({
  currentVisibility,
  isVisible,
  setVisible,
  recordingId,
  onVisibilityChange = null,
  currentOffset = "0:00",
}) => {
  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);

  const publicURL = getSessionRecordingSharedLink(recordingId);
  // Component State
  const [isTextCopied, setIsTextCopied] = useState("");
  const [isAnyListChangePending, setIsAnyListChangePending] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);
  const [currentEmails, setCurrentEmails] = useState([]);
  const [sessionVisibility, setSessionVisibility] = useState(currentVisibility);
  const [dataLoading, setDataLoading] = useState(true);
  const [startFromOffset, setStartFromOffset] = useState(null);
  const sentEmails = useRef([]);

  const handleCloseModal = () => {
    setVisible(false);
  };

  const onCopyHandler = async () => {
    const offset = getSecondsFromStringifiedMinSec(startFromOffset);
    const result = await copyToClipBoard(`${publicURL}${offset ? `?t=${offset}` : ""}`);
    if (result.success) {
      setIsTextCopied(true);
      trackSessionRecordingShareLinkCopied("app");
      setTimeout(() => {
        setIsTextCopied(false);
      }, 700);
    }
  };

  const handleIframeEmbedCopy = async () => {
    const iframeEmbed = `<iframe
    width="700"
    height="615"
    frameBorder="0"
    allowFullscreen
    title="Requestly session"
    style="border:0; border-radius: 8px; overflow:hidden;"
    src="${publicURL}"
  />`;

    const result = await copyToClipBoard(iframeEmbed);
    if (result.success) {
      setIsTextCopied(true);
      trackIframeEmbedCopied();
      setTimeout(() => {
        setIsTextCopied(false);
      }, 700);
    }
  };

  const handleVisibilityChange = async (newVisibility) => {
    await updateVisibility(user?.details?.profile?.uid, recordingId, newVisibility);
    onVisibilityChange && onVisibilityChange(newVisibility);
    fetchUserEmails();
  };

  const getPrettyDescription = (visibility) => {
    switch (visibility) {
      case Visibility.ONLY_ME:
        return isSharedWorkspaceMode
          ? "No one outside this workspace can access this recording"
          : "No one except me can access this recording";
      case Visibility.PUBLIC:
        return "Anyone on the Internet with the link can view";
      case Visibility.CUSTOM:
        return isSharedWorkspaceMode
          ? "People in this Workspace & listed below can open with the link"
          : "Only people listed below can open with the link";
      case Visibility.ORGANIZATION:
        return "Only people in your organization can access this recording";

      default:
        return visibility;
    }
  };

  const allOptions = [
    {
      key: Visibility.ONLY_ME,
      label: isSharedWorkspaceMode ? "Private to workspace" : "Private to me",
    },
    {
      key: Visibility.PUBLIC,
      label: "Anyone with the link",
    },
    // { // commented until supported
    //   key: Visibility.ORGANIZATION,
    //   label: "All members of my organization",
    //   disabled: true,
    //   tag: "Coming Soon",
    // },
    {
      key: Visibility.CUSTOM,
      label: isSharedWorkspaceMode ? "Only with specific people outside this workspace" : "Only with specific people",
    },
  ];

  const handleSave = async () => {
    setConfirmLoading(true);

    if (_.isEmpty(currentEmails)) {
      await updateVisibility(user?.details?.profile?.uid, recordingId, Visibility.ONLY_ME, currentEmails);
      onVisibilityChange && onVisibilityChange(Visibility.ONLY_ME);
    } else {
      const recipients = currentEmails.filter((email) => !sentEmails.current.includes(email));

      await updateVisibility(user?.details?.profile?.uid, recordingId, "custom", currentEmails);

      const functions = getFunctions(firebaseApp);
      const sendSessionRecordingAsEmail = httpsCallable(functions, "sessionRecording-sendRecordingAsEmail");

      if (recipients.length > 0) {
        await sendSessionRecordingAsEmail({
          sessionRecordingData: { id: recordingId, publicURL },
          recipientEmails: recipients,
        });
      }

      sentEmails.current = currentEmails;

      onVisibilityChange && onVisibilityChange(Visibility.CUSTOM);
    }

    setConfirmLoading(false);
    setIsAnyListChangePending(false);
  };

  const renderRestrictedUsersList = () => {
    if (dataLoading) return <SpinnerColumn />;
    return (
      <>
        <label htmlFor="user_emails" className="text-gray caption">
          Email addresses
        </label>
        <EmailInputWithDomainBasedSuggestions
          onChange={(emails) => {
            setIsAnyListChangePending(true);
            setCurrentEmails(emails);
          }}
        />
        {isAnyListChangePending ? (
          <Row>
            <Col span={24} style={{ marginTop: "8px" }}>
              <Button type="primary" onClick={handleSave} loading={confirmLoading}>
                Save list
              </Button>
            </Col>
          </Row>
        ) : null}
      </>
    );
  };

  const fetchUserEmails = useCallback(async () => {
    fetchCurrentEmails(recordingId)
      .then((emails) => {
        setCurrentEmails(emails);
        sentEmails.current = emails;
        setDataLoading(false);
      })
      .catch(() => {
        alert("An unexpected error has occurred!");
        return;
      });
  }, [recordingId]);

  useEffect(() => {
    if (currentVisibility !== Visibility.CUSTOM) return;
    fetchUserEmails();
  }, [currentVisibility, fetchUserEmails]);

  if (_.isEmpty(recordingId)) return null;

  return (
    <Modal
      title={
        <span>
          <ShareAltOutlined style={{ marginRight: 5 }} /> Share Replay
        </span>
      }
      open={isVisible}
      onCancel={handleCloseModal}
      width={640}
      maskClosable={false}
      footer={[
        <Row justify="space-between">
          <div>
            {sessionVisibility === Visibility.ONLY_ME ? null : (
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <Button shape="default" onClick={onCopyHandler}>
                  <div
                    style={{
                      gap: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <AiOutlineLink />
                    Copy Link
                  </div>
                </Button>
                <Button shape="default" onClick={handleIframeEmbedCopy}>
                  <div
                    style={{
                      gap: "0.5rem",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    Copy Iframe Embed
                  </div>
                </Button>
                {isTextCopied && (
                  <Typography.Text style={{ alignSelf: "center" }} type="secondary">
                    Copied!
                  </Typography.Text>
                )}
              </div>
            )}
          </div>
          <Button key="submit" type="primary" onClick={handleCloseModal}>
            Done
          </Button>
        </Row>,
      ]}
    >
      <Row>
        <Col span={24}>
          <Row align="middle" justify="space-between">
            <Col flex="0.9">
              <Row align="middle">
                <Col flex="auto">
                  <Radio.Group
                    style={{ width: "100%" }}
                    value={sessionVisibility}
                    onChange={(e) => {
                      setSessionVisibility(e.target.value);
                      handleVisibilityChange(e.target.value, recordingId);
                    }}
                  >
                    {allOptions.map((option) => {
                      return (
                        <Col span={24} className="radio-share-option" key={option.key}>
                          <Radio value={option.key} disabled={option.disabled} className="share-recording-radio">
                            <Row align="middle">
                              {renderHeroIcon(option.key)} {option.label}{" "}
                              {option.tag && (
                                <Tag style={{ marginLeft: "0.5rem" }} color="green">
                                  {option.tag}
                                </Tag>
                              )}
                            </Row>
                          </Radio>
                          {sessionVisibility === option.key && (
                            <div className="share-option-description">
                              <p className="hp-p1-body hp-text-color-black-60">{getPrettyDescription(option.key)}</p>
                            </div>
                          )}
                        </Col>
                      );
                    })}
                  </Radio.Group>
                  {sessionVisibility === Visibility.CUSTOM && (
                    <div className="share-option-description">{renderRestrictedUsersList()}</div>
                  )}
                  {sessionVisibility !== Visibility.ONLY_ME && (
                    <StartFromOffsetInput
                      currentOffset={currentOffset}
                      onOffsetChange={(offset) => setStartFromOffset(offset)}
                    />
                  )}
                </Col>
              </Row>
            </Col>
          </Row>
        </Col>
      </Row>
    </Modal>
  );
};

export default ShareRecordingModal;
