import React, { useMemo } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/selectors";
import CopyButton from "components/misc/CopyButton";
import { MockMetadata } from "@requestly/mock-server/build/types/mock";
import { redirectToMockEditorEditMock } from "utils/RedirectionUtils";
import { generateFinalUrlParts } from "components/features/mocksV2/utils";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { trackHomeMockActionClicked } from "components/Home/analytics";
import "./mocksListItem.scss";

interface Props {
  mock: MockMetadata;
}

export const MocksListItem: React.FC<Props> = ({ mock }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const { url } = useMemo(
    () =>
      generateFinalUrlParts(
        mock.endpoint,
        user?.details?.profile?.uid,
        user?.details?.username,
        workspace?.id,
        mock.password
      ),
    [mock.endpoint, user?.details?.profile?.uid, user?.details?.username, workspace?.id, mock.password]
  );

  return (
    <Row
      className="mocks-card-list-item"
      justify="space-between"
      align="middle"
      onClick={() => {
        trackHomeMockActionClicked("mock_name");
        redirectToMockEditorEditMock(navigate, mock.id);
      }}
    >
      <Col className="mocks-card-list-item-name">{mock.name}</Col>
      <Col className="mocks-card-list-item-btns-wrapper">
        <CopyButton
          tooltipText="copy mock URL"
          showIcon={true}
          title={null}
          type="text"
          copyText={url}
          trackCopiedEvent={() => trackHomeMockActionClicked("copy_mock_url")}
        />
      </Col>
    </Row>
  );
};
