import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Col, Row, Table } from "antd";
//CONSTANTS
import APP_CONSTANTS from "config/constants";
import { isEmpty } from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import SpinnerColumn from "../../../../../../../../components/misc/SpinnerColumn";
import { toast } from "utils/Toast.js";
import { redirectToWorkspaceSettings } from "../../../../../../../../utils/RedirectionUtils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import ContactUsModal from "./ContactUsModal";
import MemberRoleDropdown from "../../common/MemberRoleDropdown";
import "./TeamMembersTable.css";
import MemberActionsDropdown from "../../common/MemberActionsDropdown";
import { ClockCircleOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { SendInviteButton } from "./SendInviteButton/SendInviteButton";
import { RoleBasedComponent } from "features/rbac";
import { Conditional } from "components/common/Conditional";
import { getDisplayTextForRole } from "features/settings/utils";
import { useCurrentWorkspaceUserRole } from "hooks";

const TeamMembersTable = ({ teamId, isTeamAdmin, refresh, callback, teamDetails }) => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  //Global State
  const user = useSelector(getUserAuthDetails);
  const loggedInUserId = user?.details?.profile?.uid;
  const [isLoggedInUserAdmin, setIsLoggedInUserAdmin] = useState(false);
  const { role } = useCurrentWorkspaceUserRole();
  // Component State
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [contactUsModal, setContactUsModal] = useState(false);
  const [isTeamPlanActive, setIsTeamPlanActive] = useState(true);
  const [billingExclude, setBillingExclude] = useState([]);

  const getTeamUsers = useMemo(() => httpsCallable(getFunctions(), "teams-getTeamUsers"), []);

  const getPendingUsers = useMemo(() => httpsCallable(getFunctions(), "teams-getPendingUsers"), []);

  const getTeamSubscriptionInfo = useMemo(() => httpsCallable(getFunctions(), "teams-getTeamSubscriptionInfo"), []);

  const getTeamBillingExclude = useMemo(() => httpsCallable(getFunctions(), "teams-getTeamBillingExclude"), []);

  const changeTeamUserRole = ({ teamId, userId, updatedRole, isAdmin, setIsLoading }) => {
    if (isAdmin && updatedRole === "admin") {
      return;
    }

    setIsLoading(true);
    const functions = getFunctions();
    const updateTeamUserRole = httpsCallable(functions, "teams-updateTeamUserRole");

    updateTeamUserRole({
      teamId: teamId,
      userId: userId,
      role: updatedRole,
    })
      .then((res) => {
        toast.info("Successfully changed the role");
        modifyMembersCallback();
      })
      .catch((err) => {
        toast.error(err.message);
      })
      .finally(() => setIsLoading(false));
  };

  const toggleContactUsModal = () => setContactUsModal((prev) => !prev);

  const renderLoader = () => <SpinnerColumn message="Finding your teammates" />;

  const columns = [
    {
      title: "User",
      dataIndex: "img",
      key: "img",
      align: "left",
      ellipsis: true,
      colSpan: 4,
      onCell: () => ({ colSpan: 4 }),
      render: (member) => (
        <Row align="middle">
          <Col>
            <Avatar size={42} shape="square" src={member.photoUrl} alt={member.displayName} className="member-avatar" />
          </Col>
          <Col>
            <Row className="text-bold">
              {!member?.isPending
                ? member?.displayName
                  ? member.email === "requestly.extension@gmail.com"
                    ? "Requestly Enterprise Support"
                    : member?.displayName +
                      (loggedInUserId === member.id ? " (You) " : "") +
                      (billingExclude.includes(member.id) ? " (Free) " : "")
                  : null
                : null}
            </Row>
            <Row align={"middle"}>
              <span className="member-email">
                {member.email +
                  (member?.displayName ? "" : loggedInUserId === member.id ? " (You) " : "") +
                  (billingExclude.includes(member.id) ? " (Free) " : "")}
              </span>

              {member?.isPending ? (
                <>
                  <Badge
                    count={
                      <div
                        className={member?.isInviteExpired ? "invite-expired-tag-container" : "pending-tag-container"}
                      >
                        <span>
                          {member?.isInviteExpired ? (
                            <>
                              <InfoCircleOutlined /> Invite Expired
                            </>
                          ) : (
                            <>
                              {" "}
                              <ClockCircleOutlined /> Pending
                            </>
                          )}
                        </span>
                      </div>
                    }
                  />

                  <RoleBasedComponent resource="workspace" permission="update">
                    <Conditional condition={member?.isInviteExpired}>
                      <SendInviteButton
                        role={member?.isAdmin ? "admin" : "write"}
                        teamId={teamId}
                        teamName={teamDetails?.name}
                        numberOfMembers={teamDetails?.accessCount}
                        email={member.email}
                        onInvite={fetchTeamMembers}
                        source="team_members_table"
                      />
                    </Conditional>
                  </RoleBasedComponent>
                </>
              ) : null}
            </Row>
          </Col>
        </Row>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (member) => {
        if (member.isPending) return null;

        if (member.isOwner) return <div>Admin</div>;

        if (member.id === loggedInUserId) {
          return <div>{getDisplayTextForRole(member.role)}</div>;
        }

        return (
          <MemberRoleDropdown
            key={member.id}
            source="membersTable"
            showLoader
            isHoverEffect={isLoggedInUserAdmin && member?.id !== loggedInUserId}
            placement="bottomLeft"
            memberRole={member.role}
            loggedInUserTeamRole={role}
            isAdmin={member.isAdmin} // TODO: To be cleanup
            memberId={member.id}
            isPending={member.isPending}
            loggedInUserId={loggedInUserId}
            isLoggedInUserAdmin={isLoggedInUserAdmin}
            handleMemberRoleChange={(_, role, setIsLoading) =>
              changeTeamUserRole({
                teamId,
                userId: member.id,
                updatedRole: role,
                isAdmin: member.isAdmin,
                setIsLoading,
              })
            }
          />
        );
      },
    },
    {
      title: "",
      dataIndex: "role",
      align: "right",
      render: (member) => {
        if (member.id === loggedInUserId || !isLoggedInUserAdmin || member.isOwner) return null;

        return (
          <MemberActionsDropdown
            showLoader
            teamId={teamId}
            isHoverEffect
            placement="bottomLeft"
            isCurrentUserAdmin={isLoggedInUserAdmin}
            isLoggedInUserAdmin={isLoggedInUserAdmin}
            member={member}
            fetchTeamMembers={fetchTeamMembers}
          />
        );
      },
    },
  ];

  const renderTable = () => (
    <Table pagination={false} columns={columns} dataSource={dataSource} className="workspace-member-table" />
  );

  const fetchBillingExclude = () => {
    getTeamBillingExclude({
      teamId: teamId,
    })
      .then((res) => {
        const response = res.data;
        if (response.success) {
          setBillingExclude(response.billingExclude);
        }
      })
      .catch((err) => {
        setBillingExclude([]);
      });
  };

  const fetchTeamMembers = () => {
    getTeamUsers({
      teamId: teamId,
    })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (response.success) {
          setMembers(response.users);
        } else {
          throw new Error(response.message);
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
        toast.error(err.message);
        redirectToWorkspaceSettings(navigate, window.location.pathname, "my_profile");
      });

    getPendingUsers({
      teamId: teamId,
    })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (response.success) {
          setPendingMembers(response.users || []);
        } else {
          throw new Error(response.message);
        }
      })
      .catch((err) => {
        if (!mountedRef.current) return null;
      });
  };

  //eslint-disable-next-line
  const stableFetchTeamMembers = useCallback(fetchTeamMembers, [teamId, navigate]);

  const fetchTeamSubscriptionStatus = () => {
    getTeamSubscriptionInfo({ teamId: teamId })
      .then((res) => {
        const response = res.data;
        setIsTeamPlanActive(
          response.subscriptionStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE ||
            response.subscriptionStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.TRIALING
        );
      })
      .catch((err) => new Error(err));
  };

  const stableFetchTeamSubscriptionStatus = useCallback(fetchTeamSubscriptionStatus, [getTeamSubscriptionInfo, teamId]);

  const modifyMembersCallback = () => {
    setMembers([]); // To render loader
    mountedRef.current = true;
    fetchTeamMembers();
    isTeamPlanActive && fetchBillingExclude();
    callback && callback();
  };

  //eslint-disable-next-line
  const stableModifyMembersCallback = useCallback(modifyMembersCallback, []);

  // For loading data first time
  useEffect(() => {
    stableFetchTeamMembers();
    return () => {
      mountedRef.current = false;
    };
  }, [stableFetchTeamMembers]);

  // For refreshing data after modification has been made to the members list
  useEffect(() => {
    stableModifyMembersCallback();
  }, [stableModifyMembersCallback, refresh]);

  useEffect(() => {
    setDataSource([]);

    const currentUser = members?.filter((member) => member.id === loggedInUserId) || [];
    const otherMembers = members?.filter((member) => member.id !== loggedInUserId) || [];

    const membersData = [...currentUser, ...otherMembers, ...pendingMembers].map((member, idx) => ({
      key: idx + 1,
      img: member,
      member: member,
      role: member,
      actions: member,
    }));

    setDataSource(membersData);
    setIsLoggedInUserAdmin(currentUser[0]?.isAdmin);
  }, [members, loggedInUserId, pendingMembers]);

  useEffect(() => {
    if (user.details?.isLoggedIn) {
      stableFetchTeamSubscriptionStatus();
    }
  }, [user, stableFetchTeamSubscriptionStatus, teamId, isTeamPlanActive]);

  return (
    <>
      {/* Since members array can never be empty in any case, we can use it to show/hide loader */}
      {isEmpty(members) ? renderLoader() : renderTable()}
      <ContactUsModal isOpen={contactUsModal} toggleModal={toggleContactUsModal} />
    </>
  );
};

export default TeamMembersTable;
