import React, { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, Col, Dropdown, Popconfirm, Row, Table } from "antd";
import { RQButton } from "lib/design-system/components";
import { getBillingTeamMembers, getBillingTeamById } from "store/features/billing/selectors";
import { getUserAuthDetails } from "store/selectors";
import { BillingTeamMemberStatus, BillingTeamRoles } from "features/settings/components/BillingTeam/types";
import { BillingAction } from "./types";
import { removeMemberFromBillingTeam, revokeBillingTeamInvite, updateBillingTeamMemberRole } from "backend/billing";
import { ActionLoadingModal } from "componentsV2/modals/ActionLoadingModal";
import { toast } from "utils/Toast";
import type { MenuProps } from "antd";
import { IoMdAdd } from "@react-icons/all-files/io/IoMdAdd";
import { IoMdCloseCircleOutline } from "@react-icons/all-files/io/IoMdCloseCircleOutline";
import { HiOutlineDotsHorizontal } from "@react-icons/all-files/hi/HiOutlineDotsHorizontal";
import { MdOutlinePaid } from "@react-icons/all-files/md/MdOutlinePaid";
import { MdOutlineAdminPanelSettings } from "@react-icons/all-files/md/MdOutlineAdminPanelSettings";
import { MdPersonOutline } from "@react-icons/all-files/md/MdPersonOutline";
import { MdOutlineMoneyOffCsred } from "@react-icons/all-files/md/MdOutlineMoneyOffCsred";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import { isMenuItemDisabled } from "./utils";
import {
  trackBillingTeamActionClicked,
  trackBillingTeamMemberRemoved,
  trackBillingTeamRoleChanged,
} from "features/settings/analytics";
import { UserOutlined } from "@ant-design/icons";
import { BsPersonFillExclamation } from "@react-icons/all-files/bs/BsPersonFillExclamation";
import "./index.scss";

interface Props {
  openDrawer: () => void;
}

export const BillingTeamMembers: React.FC<Props> = ({ openDrawer }) => {
  const { billingId } = useParams();
  const user = useSelector(getUserAuthDetails);
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));
  const isUserAdmin =
    billingTeamMembers?.[user?.details?.profile?.uid] &&
    billingTeamMembers?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member;
  const [loadingRows, setLoadingRows] = useState<string[]>([]);
  const [isLoadingModalVisible, setIsLoadingModalVisible] = useState(false);

  const checkIsPendingMember = useCallback((member: any) => {
    return member.status === BillingTeamMemberStatus.PENDING;
  }, []);

  const membersTableSource = useMemo(() => {
    const members = billingTeamMembers ? Object.values(billingTeamMembers) : [];
    if (billingTeamDetails?.pendingMembers) {
      members.push(
        ...Object.keys(billingTeamDetails?.pendingMembers).map((email) => {
          return {
            id: email,
            email: email,
            displayName: "",
            role: BillingTeamRoles.Member,
            status: BillingTeamMemberStatus.PENDING,
            inviteId: billingTeamDetails?.pendingMembers?.[email]?.inviteId,
          };
        })
      );
    }
    return members;
  }, [billingTeamDetails?.pendingMembers, billingTeamMembers]);

  const handleInvokePendingMemberInvite = useCallback(
    (inviteId: string, email: string, id: string) => {
      revokeBillingTeamInvite(inviteId, email)
        .then(() => {
          toast.success("Invite revoked successfully");
          trackBillingTeamMemberRemoved(email, billingId);
        })
        .catch(() => {
          toast.error("Error while revoking invite");
        })
        .finally(() => {
          setLoadingRows(loadingRows.filter((row) => row !== id));
          setIsLoadingModalVisible(false);
        });
    },
    [billingId, loadingRows]
  );

  const handleRemoveMemberFromBillingTeam = useCallback(
    (id: string, email: string) => {
      removeMemberFromBillingTeam(billingId, id)
        .then(() => {
          toast.success("User removed from the billing team");
          trackBillingTeamMemberRemoved(email, billingId);
        })
        .catch(() => {
          toast.error("Error while removing user");
        })
        .finally(() => {
          setLoadingRows(loadingRows.filter((row) => row !== id));
          setIsLoadingModalVisible(false);
        });
    },
    [billingId, loadingRows]
  );

  const handleRemoveMember = useCallback(
    (id: string, email: string, status: BillingTeamMemberStatus, inviteId?: string) => {
      trackBillingTeamActionClicked(BillingAction.REMOVE);
      setLoadingRows([...loadingRows, id]);
      setIsLoadingModalVisible(true);
      if (status === BillingTeamMemberStatus.PENDING) {
        handleInvokePendingMemberInvite(inviteId, email, id);
      } else {
        handleRemoveMemberFromBillingTeam(id, email);
      }
    },
    [loadingRows, handleInvokePendingMemberInvite, handleRemoveMemberFromBillingTeam]
  );

  const handleRoleChange = useCallback(
    (id: string, email: string, role: BillingTeamRoles) => {
      setLoadingRows([...loadingRows, id]);
      updateBillingTeamMemberRole(billingId, id, role as BillingTeamRoles)
        .then(() => {
          toast.success(`User role changed to ${role}`);
          trackBillingTeamRoleChanged(email, role, billingId);
        })
        .catch(() => {
          toast.error("Error while changing user role");
        })
        .finally(() => {
          setLoadingRows(loadingRows.filter((row) => row !== id));
        });
    },
    [billingId, loadingRows]
  );

  const getMemberDropdownItems = useCallback(
    (id: string, email: string, status: BillingTeamMemberStatus, inviteId?: string): MenuProps["items"] => {
      return [
        {
          key: BillingAction.MAKE_ADMIN,
          label: (
            <Row align="middle" gutter={8} onClick={() => trackBillingTeamActionClicked("make_admin")}>
              <MdOutlineAdminPanelSettings fontSize={16} className="mr-8" />
              Make Admin
            </Row>
          ),
        },
        {
          key: BillingAction.MAKE_MEMBER,
          label: (
            <Row align="middle" gutter={8} onClick={() => trackBillingTeamActionClicked("remove_as_admin")}>
              <MdPersonOutline fontSize={16} className="mr-8" />
              Change role to member
            </Row>
          ),
        },
        {
          key: BillingAction.REMOVE,
          label: (
            <Popconfirm
              title="Are you sure you want to remove this member?"
              onConfirm={() => handleRemoveMember(id, email, status, inviteId)}
              okText="Yes"
              cancelText="No"
              showArrow={false}
            >
              <Row align="middle" gutter={8} onClick={() => trackBillingTeamActionClicked("remove_member")}>
                <IoMdCloseCircleOutline fontSize={16} className="mr-8" />
                Remove
              </Row>
            </Popconfirm>
          ),
        },
      ];
    },
    [handleRemoveMember]
  );

  const columns = useMemo(
    () => [
      {
        title: `Member (${membersTableSource?.length})`,
        key: "id",
        width: 460,
        render: (_: any, record: Record<string, any>) => (
          <Row className={`${loadingRows.includes(record.id) ? "loading-cell" : ""}`}>
            <div className="billing-team-member-avatar-wrapper">
              {record?.photoUrl ? (
                <Avatar size={34} shape="circle" src={record.photoUrl} alt={record.displayName} />
              ) : (
                <Avatar size={34} shape="circle" icon={<UserOutlined />} alt="User icon" />
              )}
            </div>
            <div className={checkIsPendingMember(record) ? "display-row-center" : ""}>
              <Row align={"middle"} gutter={4}>
                <Col>
                  {checkIsPendingMember(record) ? (
                    <>{record.email}</>
                  ) : (
                    <span className="text-bold text-white">{`${record.displayName ?? "User"}`}</span>
                  )}
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
                {billingTeamDetails?.billingExclude?.includes(record.id) && (
                  <Col>
                    <Row className="icon__wrapper" align="middle">
                      <MdOutlineMoneyOffCsred style={{ marginRight: "2px" }} />
                      <span className="caption">Free</span>
                    </Row>
                  </Col>
                )}
                {checkIsPendingMember(record) && (
                  <Col>
                    <Row className="icon__wrapper danger" align="middle">
                      <BsPersonFillExclamation style={{ marginRight: "2px" }} />
                      <span className="caption">Not joined</span>
                    </Row>
                  </Col>
                )}
              </Row>
              {!checkIsPendingMember(record) && (
                <div>
                  <span className="billing-team-member-email">{record.email}</span>
                </div>
              )}
            </div>
          </Row>
        ),
      },
      {
        title: "Added on",
        dataIndex: "joiningDate",
        render: (joiningDate: number, record: any) => (
          <div className={`text-white ${loadingRows.includes(record.id) ? "loading-cell" : ""}`}>
            {joiningDate ? getLongFormatDateString(new Date(joiningDate)) : "-"}
          </div>
        ),
      },
      {
        title: "",
        key: "action",
        render: (_: any, record: any) => {
          if (!isUserAdmin || record.id === user?.details?.profile?.uid || record.role === BillingTeamRoles.Manager) {
            return null;
          }
          return (
            <Row
              justify="end"
              align="middle"
              gutter={8}
              className={`w-full ${loadingRows.includes(record.id) ? "loading-cell" : ""}`}
            >
              <Col>
                <Dropdown
                  menu={{
                    items: getMemberDropdownItems(record.id, record.email, record?.status, record?.inviteId).map(
                      (item) => ({
                        ...item,
                        disabled: isMenuItemDisabled(item.key as BillingAction, record.role, record?.status),
                      })
                    ),
                    onClick: ({ key }) => {
                      switch (key) {
                        case BillingAction.MAKE_ADMIN:
                          handleRoleChange(record.id, record.email, BillingTeamRoles.Admin);
                          break;
                        case BillingAction.MAKE_MEMBER:
                          handleRoleChange(record.id, record.email, BillingTeamRoles.Member);
                          break;
                        default:
                          break;
                      }
                    },
                  }}
                  trigger={["click"]}
                  disabled={!isUserAdmin}
                  overlayStyle={{ width: "200px" }}
                  overlayClassName="billing-team-members-table-dropdown"
                >
                  <RQButton
                    className="members-table-dropdown-btn"
                    icon={<HiOutlineDotsHorizontal />}
                    iconOnly
                    type="text"
                  />
                </Dropdown>
              </Col>
            </Row>
          );
        },
      },
    ],
    [
      membersTableSource?.length,
      loadingRows,
      billingTeamDetails?.billingExclude,
      isUserAdmin,
      user?.details?.profile?.uid,
      getMemberDropdownItems,
      handleRoleChange,
      checkIsPendingMember,
    ]
  );

  return (
    <>
      <Col className="billing-teams-primary-card billing-team-members-section">
        <Row className="billing-team-members-section-header w-full" justify="space-between" align="middle">
          <Col className="billing-team-members-section-header-title">Members in billing team</Col>
          <Col>
            <RQButton
              type="default"
              icon={<IoMdAdd />}
              className="billing-team-members-section-header-btn"
              onClick={openDrawer}
              disabled={!isUserAdmin}
            >
              Add members
            </RQButton>
          </Col>
        </Row>
        <Table
          className="billing-table my-billing-team-members-table"
          dataSource={membersTableSource}
          columns={columns}
          pagination={false}
          scroll={{ y: "35vh" }}
          loading={!billingTeamMembers}
        />
      </Col>
      <ActionLoadingModal
        isOpen={isLoadingModalVisible}
        onClose={() => setIsLoadingModalVisible(false)}
        title="Removing user..."
        message="Pleae wait while we process your request"
      />
    </>
  );
};
