import { Avatar, Col, Popover, Row, Table, Tooltip } from "antd";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { useHasChanged } from "hooks";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getAvailableBillingTeams, getBillingTeamById, getBillingTeamMembers } from "store/features/billing/selectors";
import { TeamPlanStatus } from "../../TeamPlanStatus";
import { TeamDetailsPopover } from "./components/TeamDetailsPopover";
import { RQButton } from "lib/design-system/components";
import { BillingTeamMember, BillingTeamRoles } from "../../../types";
import { MdOutlinePaid } from "@react-icons/all-files/md/MdOutlinePaid";
import { MdOutlineAdminPanelSettings } from "@react-icons/all-files/md/MdOutlineAdminPanelSettings";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { RequestBillingTeamAccessModal } from "../modals/RequestBillingTeamAccessModal/RequestBillingTeamAccessModal";
import "./index.scss";
import { getFunctions, httpsCallable } from "firebase/functions";
import { toast } from "utils/Toast";

export const OtherBillingTeamDetails: React.FC = () => {
  const { billingId } = useParams();
  const user = useSelector(getUserAuthDetails);
  const billingTeams = useSelector(getAvailableBillingTeams);
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId)) as Record<string, BillingTeamMember>;
  const membersTableSource = billingTeamMembers ? Object.values(billingTeamMembers) : [];
  const [isPlanDetailsPopoverOpen, setIsPlanDetailsPopoverOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const hasJoinedAnyTeam = useMemo(
    () => billingTeams.some((team) => user?.details?.profile?.uid && user?.details?.profile?.uid in team.members),
    [billingTeams, user?.details?.profile?.uid]
  );
  const hasBillingIdChanged = useHasChanged(billingId);
  const [isLoading, setIsLoading] = useState(false);
  const isAcceleratorTeam = billingTeamDetails?.isAcceleratorTeam;

  const handleJoinAcceleratorTeam = useCallback(() => {
    const emails = user?.details?.profile?.email ? [user.details.profile.email] : [];

    const requestJoinAcceleratorTeam = httpsCallable<{ userEmails: string[]; billingId: string }>(
      getFunctions(),
      "billing-joinAcceleratorTeam"
    );

    requestJoinAcceleratorTeam({
      userEmails: emails,
      billingId: billingTeams[0].id,
    })
      .then(() => {
        setIsLoading(true);
        toast.success(`${billingTeams[0].name} joined successfully!`);
      })
      .catch((err) => {
        setIsLoading(true);
        toast.error("Failed to join the team! Please try again, or contact support if the problem persists");
      });
  }, [billingTeams, user?.details?.profile?.email]);

  const columns = useMemo(
    () => [
      {
        title: `Licensed members (${membersTableSource.length})`,
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
                  {(isAcceleratorTeam && record.role === BillingTeamRoles.Manager) ||
                  record.role === BillingTeamRoles.Admin ? (
                    <Row className="icon__wrapper warning" align="middle">
                      <MdOutlineAdminPanelSettings style={{ marginRight: "2px" }} />
                      <span className="caption">Admin</span>
                    </Row>
                  ) : record.role === BillingTeamRoles.Manager ? (
                    <Row className="icon__wrapper success" align="middle">
                      <MdOutlinePaid style={{ marginRight: "2px" }} />
                      <span className="caption">Billing manager</span>
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
        title: <div className="text-right">Assigned on</div>,
        dataIndex: "joiningDate",
        render: (joiningDate: number) => (
          <div className="text-white text-right">
            {joiningDate ? getLongFormatDateString(new Date(joiningDate)) : "-"}
          </div>
        ),
      },
    ],
    [membersTableSource.length, isAcceleratorTeam]
  );

  useEffect(() => {
    if (hasBillingIdChanged) {
      setIsPlanDetailsPopoverOpen(false);
    }
  }, [hasBillingIdChanged]);

  if (!billingTeamDetails) {
    return null;
  }

  return (
    <>
      <div className="display-row-center w-full">
        <div className="w-full" style={{ maxWidth: "1000px" }}>
          <Col className="my-billing-team-title">{billingTeamDetails.name}</Col>
          <Col className="billing-teams-primary-card mt-8">
            {billingTeamDetails?.subscriptionDetails ? (
              <Row
                className="items-center other-team-members-table-header"
                align="middle"
                justify="space-between"
                gutter={8}
              >
                <Col>
                  <Row align="middle" gutter={8}>
                    <Col
                      style={{
                        paddingRight: 0,
                        paddingLeft: 0,
                      }}
                    >
                      <TeamPlanStatus
                        subscriptionStatus={billingTeamDetails?.subscriptionDetails?.subscriptionStatus}
                      />
                    </Col>
                    <Col>
                      <Popover
                        overlayClassName="team-details-popover"
                        open={isPlanDetailsPopoverOpen}
                        content={
                          <TeamDetailsPopover
                            teamDetails={billingTeamDetails}
                            closePopover={() => setIsPlanDetailsPopoverOpen(false)}
                          />
                        }
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
                </Col>

                {!hasJoinedAnyTeam && (
                  <Col>
                    {!isAcceleratorTeam ? (
                      <Tooltip title="On clicking, we'll notify the billing manager and admins to assign a license to you.">
                        <RQButton
                          className="request-billing-team-btn"
                          type="default"
                          icon={<IoMdAdd />}
                          onClick={() => setIsRequestModalOpen(true)}
                        >
                          Request Premium access
                        </RQButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="On clicking, you will join the team">
                        <RQButton
                          className="request-billing-team-btn"
                          type="default"
                          icon={<IoMdAdd />}
                          onClick={handleJoinAcceleratorTeam}
                          loading={isLoading}
                        >
                          Join Team
                        </RQButton>
                      </Tooltip>
                    )}
                  </Col>
                )}
              </Row>
            ) : null}
            <Table
              className="billing-table"
              dataSource={membersTableSource}
              columns={columns}
              pagination={false}
              scroll={{ y: "65vh" }}
              loading={!billingTeamMembers}
            />
          </Col>
        </div>
      </div>

      {isRequestModalOpen && (
        <RequestBillingTeamAccessModal
          isOpen={isRequestModalOpen}
          onClose={() => setIsRequestModalOpen(false)}
          billingId={billingId!}
        />
      )}
    </>
  );
};
