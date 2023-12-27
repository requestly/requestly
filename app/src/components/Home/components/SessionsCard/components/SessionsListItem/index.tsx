import React, { useState } from "react";
import { Row, Col } from "antd";
import { useNavigate } from "react-router-dom";
import { RQButton } from "lib/design-system/components";
import { redirectToSavedSession } from "utils/RedirectionUtils";
import { SessionRecording } from "views/features/sessions/types";
import { MdOutlineShare } from "@react-icons/all-files/md/MdOutlineShare";
import CopyButton from "components/misc/CopyButton";
import PATHS from "config/constants/sub/paths";
import ShareRecordingModal from "views/features/sessions/ShareRecordingModal";
import "./sessionsListItem.scss";

interface Props {
  session: SessionRecording;
}

export const SessionsListItem: React.FC<Props> = ({ session }) => {
  const navigate = useNavigate();
  const [isShareModalVisible, setIsShareModalVisible] = useState(false);

  return (
    <>
      <Row
        className="session-card-list-item"
        justify="space-between"
        align="middle"
        onClick={() => redirectToSavedSession(navigate, session.id)}
      >
        <Col className="session-card-list-item-name">{session.name}</Col>
        <Col className="session-card-list-item-btns-wrapper">
          <RQButton
            type="text"
            iconOnly
            icon={<MdOutlineShare className="text-white" />}
            onClick={(e) => {
              e.stopPropagation();
              setIsShareModalVisible(true);
            }}
          />
          {/* <RQButton
          type="text"
          iconOnly
          icon={<MdContentCopy className="text-white" style={{ transform: "scaleY(-1)" }}  />}
        /> */}
          <CopyButton
            showIcon={true}
            title={null}
            type="text"
            copyText={`${window.location.origin}${PATHS.SESSIONS.SAVED.ABSOLUTE}/${session.id}`}
            trackCopiedEvent={() => {}}
          />
        </Col>
      </Row>
      {isShareModalVisible && (
        <ShareRecordingModal
          isVisible={isShareModalVisible}
          setVisible={setIsShareModalVisible}
          recordingId={session.id}
          currentVisibility={session.visibility}
        />
      )}
    </>
  );
};
