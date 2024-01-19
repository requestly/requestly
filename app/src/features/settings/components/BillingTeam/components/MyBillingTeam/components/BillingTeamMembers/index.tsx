import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { Avatar, Col, Drawer, Dropdown, Popconfirm, Row, Table } from "antd";
import { RQButton } from "lib/design-system/components";
import { OrgMembersTable } from "features/settings/components/OrgMembersTable";
import { MemberTableActions } from "./components/MemberTableActions";
import { getBillingTeamMembers } from "store/features/billing/selectors";
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
import { IoMdClose } from "@react-icons/all-files/io/IoMdClose";
import { MdPersonOutline } from "@react-icons/all-files/md/MdPersonOutline";
import { getLongFormatDateString } from "utils/DateTimeUtils";
import "./index.scss";

export const BillingTeamMembers: React.FC = () => {
  const { billingId } = useParams();

  const user = useSelector(getUserAuthDetails);
  const billingTeamMembers = useSelector(getBillingTeamMembers(billingId));
  const membersTableSource = billingTeamMembers ? Object.values(billingTeamMembers) : [];
  const isUserAdmin =
    billingTeamMembers?.[user?.details?.profile?.uid] &&
    billingTeamMembers?.[user?.details?.profile?.uid]?.role !== BillingTeamRoles.Member;

  const [isMembersDrawerOpen, setIsMembersDrawerOpen] = useState(false);
  const [loadingRows, setLoadingRows] = useState<string[]>([]);

  const columns = [
    {
      title: "Member",
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
        return (
          <Row
            justify="end"
            align="middle"
            gutter={8}
            className={`w-full  ${loadingRows.includes(record.id) ? "loading-cell" : ""}`}
          >
            <Col>
              <Popconfirm
                title="Are you sure you want to remove this user from the billing team?"
                onConfirm={() => {
                  setLoadingRows([...loadingRows, record.id]);
                  removeMemberFromBillingTeam(billingId, record.id)
                    .then(() => {
                      toast.success("User removed from the billing team");
                    })
                    .catch(() => {
                      toast.error("Error while removing user");
                    })
                    .finally(() => {
                      setLoadingRows(loadingRows.filter((row) => row !== record.id));
                    });
                }}
                okText="Confirm"
                cancelText="Cancel"
              >
                <RQButton
                  type="text"
                  icon={<IoMdCloseCircleOutline fontSize={14} />}
                  className="remove-member-btn"
                  disabled={!isUserAdmin}
                >
                  Remove
                </RQButton>
              </Popconfirm>
            </Col>
            <Col>
              <Dropdown
                menu={{
                  items: items.map((item) => ({ ...item, disabled: item.key === record.role })),
                  onClick: ({ key }) => {
                    setLoadingRows([...loadingRows, record.id]);
                    updateBillingTeamMemberRole(billingId, record.id, key as BillingTeamRoles)
                      .then(() => {
                        toast.success(`User role changed to ${key}`);
                      })
                      .catch(() => {
                        toast.error("Error while changing user role");
                      })
                      .finally(() => {
                        setLoadingRows(loadingRows.filter((row) => row !== record.id));
                      });
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
        <Row align="middle" gutter={8}>
          <MdOutlineAdminPanelSettings fontSize={16} className="mr-8" />
          Make Admin
        </Row>
      ),
    },
    {
      key: BillingTeamRoles.Member,
      label: (
        <Row align="middle" gutter={8}>
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
              onClick={() => setIsMembersDrawerOpen(true)}
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
      <Drawer
        placement="right"
        onClose={() => setIsMembersDrawerOpen(false)}
        open={isMembersDrawerOpen}
        width={640}
        closeIcon={null}
        mask={false}
        className="billing-team-members-drawer"
      >
        <Row className="billing-team-members-drawer-header w-full" justify="space-between" align="middle">
          <Col className="billing-team-members-drawer-header_title">Add members in billing team</Col>
          <Col>
            <IoMdClose onClick={() => setIsMembersDrawerOpen(false)} />
          </Col>
        </Row>
        <Col className="billing-team-members-drawer-body">
          <OrgMembersTable actionButtons={(record: any) => <MemberTableActions record={record} />} />
        </Col>
        <Row className="mt-8 billing-team-members-drawer-help" justify="space-between" align="middle">
          <Col>
            Couldn't find member?{" "}
            <a className="external-link" href="mailto:contact@requestly.io">
              Contact us
            </a>
            , and we'll assist you in adding your team members.
          </Col>
        </Row>
      </Drawer>
    </>
  );
};
