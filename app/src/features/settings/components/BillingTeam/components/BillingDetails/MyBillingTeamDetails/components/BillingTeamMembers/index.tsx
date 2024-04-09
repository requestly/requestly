import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, Col, Dropdown, Popconfirm, Row, Table } from "antd";
import { RQButton } from "lib/design-system/components";
import { getBillingTeamMembers, getBillingTeamById } from "store/features/billing/selectors";
import { getUserAuthDetails } from "store/selectors";
import { BillingTeamRoles } from "features/settings/components/BillingTeam/types";
import { removeMemberFromBillingTeam, updateBillingTeamMemberRole } from "backend/billing";
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
import "./index.scss";
import {
  trackBillingTeamActionClicked,
  trackBillingTeamMemberRemoved,
  trackBillingTeamRoleChanged,
} from "features/settings/analytics";

interface Props {
  openDrawer: () => void;
}

export const BillingTeamMembers: React.FC<Props> = ({ openDrawer }) => {
  const { billingId } = useParams();
  const user = useSelector(getUserAuthDetails);
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));
  const billingTeamDetails = useSelector(getBillingTeamById(billingId));

  const membersTableSource = billingTeamMembers ? Object.values(billingTeamMembers) : [];
  const isUserAdmin =
    billingTeamMembers?.[user?.details?.profile?.uid] &&
    billingTeamMembers?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member;

  const [loadingRows, setLoadingRows] = useState<string[]>([]);

  const columns = [
    {
      title: `Member (${membersTableSource?.length})`,
      key: "id",
      width: 460,
      render: (_: any, record: Record<string, any>) => (
        <Row className={`${loadingRows.includes(record.id) ? "loading-cell" : ""}`}>
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
              {billingTeamDetails?.billingExclude?.includes(record.id) && (
                <Col>
                  <Row className="icon__wrapper" align="middle">
                    <MdOutlineMoneyOffCsred style={{ marginRight: "2px" }} />
                    <span className="caption">Free</span>
                  </Row>
                </Col>
              )}
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
        const handleRemoveMember = () => {
          setLoadingRows([...loadingRows, record.id]);
          trackBillingTeamActionClicked("remove_member");
          removeMemberFromBillingTeam(billingId, record.id)
            .then(() => {
              toast.success("User removed from the billing team");
              trackBillingTeamMemberRemoved(record.email, billingId);
            })
            .catch(() => {
              toast.error("Error while removing user");
            })
            .finally(() => {
              setLoadingRows(loadingRows.filter((row) => row !== record.id));
            });
        };
        const handleRoleChange = (role: BillingTeamRoles) => {
          setLoadingRows([...loadingRows, record.id]);
          updateBillingTeamMemberRole(billingId, record.id, role as BillingTeamRoles)
            .then(() => {
              toast.success(`User role changed to ${role}`);
              trackBillingTeamRoleChanged(record.email, role, billingId);
            })
            .catch(() => {
              toast.error("Error while changing user role");
            })
            .finally(() => {
              setLoadingRows(loadingRows.filter((row) => row !== record.id));
            });
        };
        const removeAction = {
          key: "remove",
          label: (
            <Popconfirm
              title="Are you sure you want to remove this member?"
              onConfirm={handleRemoveMember}
              okText="Yes"
              cancelText="No"
            >
              <Row align="middle" gutter={8} onClick={() => trackBillingTeamActionClicked("remove_member")}>
                <IoMdCloseCircleOutline fontSize={16} className="mr-8" />
                Remove
              </Row>
            </Popconfirm>
          ),
        };
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
                  items: [...items, removeAction].map((item) => ({ ...item, disabled: item.key === record.role })),
                  onClick: ({ key }) => {
                    if (key !== "remove") {
                      handleRoleChange(key as BillingTeamRoles);
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
  ];

  const items: MenuProps["items"] = [
    {
      key: BillingTeamRoles.Admin,
      label: (
        <Row align="middle" gutter={8} onClick={() => trackBillingTeamActionClicked("make_admin")}>
          <MdOutlineAdminPanelSettings fontSize={16} className="mr-8" />
          Make Admin
        </Row>
      ),
    },
    {
      key: BillingTeamRoles.Member,
      label: (
        <Row align="middle" gutter={8} onClick={() => trackBillingTeamActionClicked("remove_as_admin")}>
          <MdPersonOutline fontSize={16} className="mr-8" />
          Change role to member
        </Row>
      ),
    },
  ];

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
    </>
  );
};
