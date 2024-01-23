import { Avatar, Col, Popover, Row, Table } from "antd";
import React from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { getBillingTeamById, getBillingTeamMembers } from "store/features/billing/selectors";
import { TeamPlanStatus } from "../TeamPlanStatus";
import { RQButton } from "lib/design-system/components";
import { BillingTeamRoles } from "../../types";
import { MdOutlinePaid } from "@react-icons/all-files/md/MdOutlinePaid";
import { MdOutlineAdminPanelSettings } from "@react-icons/all-files/md/MdOutlineAdminPanelSettings";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import "./index.scss";

export const OtherBillingTeam: React.FC = () => {
  const { billingId } = useParams();
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));
  const membersTableSource = billingTeamMembers ? Object.values(billingTeamMembers) : [];
  const [isPlanDetailsPopoverOpen, setIsPlanDetailsPopoverOpen] = React.useState(false);

  const columns = [
    {
      title: `Member (${membersTableSource.length})`,
      key: "id",
      width: "80%",
      render: (_: any, record: Record<string, any>) => (
        <Row>
          <div className="billing-team-member-avatar-wrapper">
            <Avatar size={34} shape="circle" src={record.photoUrl} alt={record.displayName} />
          </div>
          <div>
            <Row align={"middle"} gutter={4}>
              <Col>
                <span className="text-bold text-white">{`${record.displayName ?? "User"}`}</span>
              </Col>
              <Col>
                {record.role === BillingTeamRoles.Manager ? (
                  <Row className="icon__wrapper success" align="middle">
                    <MdOutlinePaid style={{ marginRight: "2px" }} />
                    <span className="caption">Billing manager</span>
                  </Row>
                ) : record.role === BillingTeamRoles.Admin ? (
                  <Row className="icon__wrapper warning" align="middle">
                    <MdOutlineAdminPanelSettings style={{ marginRight: "2px" }} />
                    <span className="caption">Admin</span>
                  </Row>
                ) : null}
              </Col>
            </Row>
            <div>
              <span className="billing-team-member-email">{record.email}</span>
            </div>
          </div>
        </Row>
      ),
    },
    {
      title: "Added on",
      dataIndex: "joiningDate",
      render: (joiningDate: number) => (
        <div className="text-white">{joiningDate ? getLongFormatDateString(new Date(joiningDate)) : "-"}</div>
      ),
    },
  ];

  return (
    <>
      <Col className="my-billing-team-title">{billingTeamDetails.name}</Col>
      <Col className="billing-teams-primary-card mt-8">
        <Row className="items-center other-team-members-table-header" align="middle" gutter={8}>
          <Col style={{ padding: 0 }}>
            <TeamPlanStatus subscriptionStatus={billingTeamDetails.subscriptionDetails.subscriptionStatus} />
          </Col>
          <Col>
            <Popover
              overlayClassName="team-details-popover"
              open={isPlanDetailsPopoverOpen}
              content={<>TEAM DETAILS HERE</>}
              showArrow={false}
              trigger="click"
              placement="bottomLeft"
              title={null}
            >
              <RQButton
                type="text"
                size="small"
                className="view-team-details-btn"
                onClick={() => setIsPlanDetailsPopoverOpen(true)}
              >
                View details
              </RQButton>
            </Popover>
          </Col>
        </Row>
        <Table
          className="billing-table"
          dataSource={membersTableSource}
          columns={columns}
          pagination={false}
          scroll={{ y: "65vh" }}
        />
      </Col>
    </>
  );
};
