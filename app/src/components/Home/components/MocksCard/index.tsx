import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { Col, Row, Spin } from "antd";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { RQButton } from "lib/design-system/components";
import { getMocks } from "backend/mocks/getMocks";
import { getUserAuthDetails } from "store/selectors";
import { MockType } from "components/features/mocksV2/types";
import { HomepageEmptyCard } from "../EmptyCard";
import { MocksListItem } from "./components/MocksListItem";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { MdOutlineCloud } from "@react-icons/all-files/md/MdOutlineCloud";
import { MockMetadata } from "@requestly/mock-server/build/types/mock";
import { redirectToMockEditorCreateMock } from "utils/RedirectionUtils";
import Logger from "lib/logger";
import PATHS from "config/constants/sub/paths";
import "./mocksCard.scss";

export const MocksCard: React.FC = () => {
  const MAX_MOCKS_TO_SHOW = 3;
  const navigate = useNavigate();
  const workspace = useSelector(getCurrentlyActiveWorkspace);
  const user = useSelector(getUserAuthDetails);
  const [isLoading, setIsLoading] = useState(true);
  const [mocks, setMocks] = useState(null);

  useEffect(() => {
    if (!user.loggedIn) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    getMocks(user?.details?.profile?.uid, MockType.API, workspace?.id)
      .then((data) => {
        const sortedMocks = data.sort((a: MockMetadata, b: MockMetadata) => Number(b.createdTs) - Number(a.createdTs));
        setMocks(sortedMocks.slice(0, MAX_MOCKS_TO_SHOW));
      })
      .catch((err) => {
        setMocks([]);
        Logger.log(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [user?.details?.profile?.uid, workspace?.id, user.loggedIn]);

  if (isLoading)
    return (
      <Col className="homepage-card-loader">
        <Spin tip="Getting your mocks ready..." size="large" />
      </Col>
    );

  return (
    <>
      {mocks?.length ? (
        <>
          <Row align="middle" justify="space-between" className="w-full">
            <Col span={18}>
              <Row gutter={8} align="middle">
                <Col>
                  <MdOutlineCloud className="mocks-card-icon" />
                </Col>
                <Col className="text-white primary-card-header">Mock Server</Col>
              </Row>
            </Col>
            <Col span={6} className="mocks-card-action-btn">
              <RQButton
                icon={<IoMdAdd className="mr-8" />}
                type="default"
                onClick={() => redirectToMockEditorCreateMock(navigate)}
              >
                New Mock
              </RQButton>
            </Col>
          </Row>
          <div className="mocks-card-list">
            {mocks.map((mock: MockMetadata, index: number) => (
              <MocksListItem key={index} mock={mock} />
            ))}
          </div>
          {mocks.length > MAX_MOCKS_TO_SHOW && (
            <Link className="homepage-view-all-link" to={PATHS.RULES.MY_RULES.ABSOLUTE}>
              View all mock APIs
            </Link>
          )}
        </>
      ) : (
        <HomepageEmptyCard
          icon={<MdOutlineCloud className="mocks-card-icon" />}
          title="Mock Server"
          description="Create mocks for your APIs with different status codes, delay, response headers or body."
          primaryButton={
            <RQButton type="primary" onClick={() => redirectToMockEditorCreateMock(navigate)}>
              Create new Mock API
            </RQButton>
          }
        />
      )}
    </>
  );
};
