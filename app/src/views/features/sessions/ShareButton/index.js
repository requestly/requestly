import { LinkOutlined, LockOutlined } from "@ant-design/icons";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { FiUsers } from "@react-icons/all-files/fi/FiUsers";
import { IoEarth } from "@react-icons/all-files/io5/IoEarth";
import ShareRecordingModal from "../ShareRecordingModal";
import {
  trackSessionRecordingShareClicked,
  trackSessionRecordingShareLinkCopied,
} from "modules/analytics/events/features/sessionRecording";
import SplitButtons from "components/misc/SplitButtons";
import { Menu } from "antd";
import { getSessionRecordingSharedLink } from "utils/PathUtils";
import { updateVisibility } from "../api";
import { Visibility } from "../SessionViewer/types";
import { useDispatch, useSelector } from "react-redux";
import { getSessionRecordingVisibility } from "store/features/session-recording/selectors";
import { sessionRecordingActions } from "store/features/session-recording/slice";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { isActiveWorkspaceShared } from "store/slices/workspaces/selectors";
import { copyToClipBoard } from "utils/Misc";

const ShareButton = ({ recordingId, showShareModal }) => {
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const isSharedWorkspaceMode = useSelector(isActiveWorkspaceShared);
  const currentVisibility = useSelector(getSessionRecordingVisibility);
  const sharedLink = getSessionRecordingSharedLink(recordingId);
  const [linkCopied, setLinkCopied] = useState();
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  useEffect(() => {
    if (showShareModal) {
      setTimeout(() => setIsShareModalVisible(true), 1000);
    }
  }, [showShareModal]);

  const getVisibilityLabel = (visibility) => {
    switch (visibility) {
      case Visibility.ONLY_ME:
      default:
        return (
          <span>
            <LockOutlined /> {isSharedWorkspaceMode ? "Private to workspace" : "Private to me"}
          </span>
        );

      case Visibility.PUBLIC:
        return (
          <span>
            <IoEarth className="fix-icon-is-up" /> Shared with everyone
          </span>
        );

      case Visibility.CUSTOM:
        return (
          <span>
            <FiUsers className="fix-icon-is-up" /> Shared with specific people
          </span>
        );
    }
  };

  const updateVisibilityInStore = (newVisibility) => {
    dispatch(sessionRecordingActions.setVisibility(newVisibility));
  };

  const handleVisibilityChange = async (newVisibility) => {
    if (currentVisibility !== newVisibility) {
      await updateVisibility(user?.details?.profile?.uid, recordingId, newVisibility);
      updateVisibilityInStore(newVisibility);
    }

    if (newVisibility === Visibility.CUSTOM) {
      setIsShareModalVisible(true);
    }
  };

  const shareOptions = useMemo(() => {
    const options = [];

    if (currentVisibility === Visibility.CUSTOM) {
      options.push({
        label: "Update people having access",
        key: Visibility.CUSTOM,
        icon: <FiUsers className="fix-icon-is-up" />,
      });
    }

    if (currentVisibility !== Visibility.ONLY_ME) {
      options.push({
        label: isSharedWorkspaceMode ? "Make private to workspace" : "Make private to me",
        key: Visibility.ONLY_ME,
        icon: <LockOutlined />,
      });
    }

    if (currentVisibility !== Visibility.PUBLIC) {
      options.push({
        label: "Share with everyone",
        key: Visibility.PUBLIC,
        icon: <IoEarth className="fix-icon-is-up" />,
      });
    }

    if (currentVisibility !== Visibility.CUSTOM) {
      options.push({
        label: "Share with specific people",
        key: Visibility.CUSTOM,
        icon: <FiUsers className="fix-icon-is-up" />,
      });
    }

    return options;
  }, [currentVisibility, isSharedWorkspaceMode]);

  const onCopyLinkClicked = useCallback(async () => {
    const result = await copyToClipBoard(sharedLink);
    if (result.success) {
      setLinkCopied(true);
      trackSessionRecordingShareLinkCopied("app");
    }
  }, [sharedLink]);

  return (
    <>
      <SplitButtons
        left={{
          label: <span className="text-bold">{getVisibilityLabel(currentVisibility)}</span>,
          onClick: () => {
            trackSessionRecordingShareClicked();
            setIsShareModalVisible(true);
          },
          isDropdown: true,
          menu: <Menu onClick={({ key }) => handleVisibilityChange(key)} items={shareOptions} />,
        }}
        right={
          currentVisibility !== Visibility.ONLY_ME && {
            icon: <LinkOutlined />,
            onClick: onCopyLinkClicked,
            tooltip: linkCopied ? "Copied" : "Copy link",
            onTooltipVisibilityChange: (visible) => {
              if (!visible) {
                setTimeout(() => setLinkCopied(false), 500);
              }
            },
          }
        }
      />
      {/* Modals */}
      {isShareModalVisible ? (
        <ShareRecordingModal
          isVisible={isShareModalVisible}
          setVisible={setIsShareModalVisible}
          recordingId={recordingId}
          currentVisibility={currentVisibility}
          onVisibilityChange={updateVisibilityInStore}
        />
      ) : null}
    </>
  );
};

export default ShareButton;
