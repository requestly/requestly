import React, { useMemo } from "react";
import { Col, Row } from "antd";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import CopyButton from "components/misc/CopyButton";
import { RQMockCollection, RQMockMetadataSchema } from "components/features/mocksV2/types";
import { redirectToMockEditorEditMock } from "utils/RedirectionUtils";
import { generateFinalUrlParts } from "components/features/mocksV2/utils";
import { trackHomeMockActionClicked } from "components/Home/analytics";
import "./mocksListItem.scss";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

interface Props {
  mock: RQMockMetadataSchema;
  collectionData?: RQMockCollection | undefined;
}

export const MocksListItem: React.FC<Props> = ({ mock, collectionData }) => {
  const navigate = useNavigate();
  const user = useSelector(getUserAuthDetails);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const { url } = useMemo(
    () =>
      generateFinalUrlParts({
        endpoint: mock.endpoint,
        uid: user?.details?.profile?.uid,
        username: user?.details?.username,
        teamId: activeWorkspaceId,
        password: mock.password,
        collectionPath: collectionData?.path ?? "",
      }),
    [
      mock.endpoint,
      mock.password,
      user?.details?.profile?.uid,
      user?.details?.username,
      activeWorkspaceId,
      collectionData?.path,
    ]
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
