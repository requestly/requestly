import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";
import { Col, Row, Spin } from "antd";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { RQButton } from "lib/design-system/components";
import { MdOutlineCloud } from "@react-icons/all-files/md/MdOutlineCloud";
import { getMocks } from "backend/mocks/getMocks";
import { getUserAuthDetails } from "store/selectors";
import { MockType } from "components/features/mocksV2/types";
import Logger from "lib/logger";
import { HomepageEmptyCard } from "../EmptyCard";
import { MocksListItem } from "./components/MocksListItem";
import { MockMetadata } from "@requestly/mock-server/build/types/mock";
import "./mocksCard.scss";
import { redirectToMockEditorCreateMock } from "utils/RedirectionUtils";

export const MocksCard: React.FC = () => {
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
        setMocks(data);
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
              <RQButton icon={<IoMdAdd className="mr-8" />} type="default">
                New Mock
              </RQButton>
            </Col>
          </Row>
          <div className="mt-8">
            {mocks.map((mock: MockMetadata, index: number) => (
              <MocksListItem key={index} mock={mock} />
            ))}
          </div>
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
