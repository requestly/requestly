import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Avatar, Badge, Col, Row, Table } from "antd";
//CONSTANTS
import APP_CONSTANTS from "config/constants";
import { isEmpty } from "lodash";
import { getFunctions, httpsCallable } from "firebase/functions";
import SpinnerColumn from "../../../../../../../misc/SpinnerColumn";
import { toast } from "utils/Toast.js";
import { redirectToMyTeams } from "../../../../../../../../utils/RedirectionUtils";
import { getUserAuthDetails } from "../../../../../../../../store/selectors";
import RemoveUserModal from "./RemoveUserModal";
import ContactUsModal from "./ContactUsModal";
import MemberRoleDropdown from "../../common/MemberRoleDropdown";
import "./TeamMembersTable.css";
import PendingMemberRoleDropwdown from "../../common/PendingMemberRoleDropwdown";
import { ClockCircleOutlined } from "@ant-design/icons";

const TeamMembersTable = ({ teamId, isTeamAdmin, refresh, callback }) => {
  const navigate = useNavigate();
  const mountedRef = useRef(true);

  //Global State
  const user = useSelector(getUserAuthDetails);
  const loggedInUserId = user?.details?.profile?.uid;
  const [isLoggedInUserAdmin, setIsLoggedInUserAdmin] = useState(false);

  // Component State
  const [members, setMembers] = useState([]);
  const [pendingMembers, setPendingMembers] = useState([]);
  const [dataSource, setDataSource] = useState([]);
  const [deleteUserModal, setDeleteUserModal] = useState({
    isActive: false,
    userId: false,
  });
  const [contactUsModal, setContactUsModal] = useState(false);
  const [isTeamPlanActive, setIsTeamPlanActive] = useState(true);
  const [billingExclude, setBillingExclude] = useState([]);

  const getTeamUsers = useMemo(() => httpsCallable(getFunctions(), "getTeamUsers"), []);

  const getPendingUsers = useMemo(() => httpsCallable(getFunctions(), "getPendingUsers"), []);

  const getTeamSubscriptionInfo = useMemo(() => httpsCallable(getFunctions(), "getTeamSubscriptionInfo"), []);

  const getTeamBillingExclude = useMemo(() => httpsCallable(getFunctions(), "getTeamBillingExclude"), []);

  const changeTeamUserRole = ({ teamId, userId, updatedRole, isAdmin, setIsLoading }) => {
    if ((isAdmin && updatedRole === "admin") || (!isAdmin && updatedRole === "user")) {
      return;
    }

    setIsLoading(true);
    const functions = getFunctions();
    const updateTeamUserRole = httpsCallable(functions, "updateTeamUserRole");

    updateTeamUserRole({
      teamId: teamId,
      userId: userId,
      role: updatedRole,
    })
      .then((res) => {
        toast.info("Successfully changed the role");
        modifyMembersCallback();
      })
      .catch((err) => toast.error(err.message))
      .finally(() => setIsLoading(false));
  };

  const toggleDeleteUserModal = () => {
    setDeleteUserModal({
      ...deleteUserModal,
      isActive: !deleteUserModal.isActive,
    });
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
      colSpan: 2,
      onCell: () => ({ colSpan: 2 }),
      render: (member) => (
        <Row align="middle">
          <Col>
            <Avatar size={42} shape="square" src={member.photoUrl} alt={member.displayName} className="member-avatar" />
          </Col>
          <Col>
            <Row className="text-bold">
              {!member?.isPending
                ? member.displayName +
                  (loggedInUserId === member.id ? " (You) " : "") +
                  (billingExclude.includes(member.id) ? " (Free) " : "")
                : null}
            </Row>
            <Row align={"middle"}>
              <span className="member-email">{member.email}</span>
              {member?.isPending ? (
                <Badge
                  count={
                    <div className="pending-tag-container">
                      <span>
                        <ClockCircleOutlined /> Pending
                      </span>
                    </div>
                  }
                />
              ) : null}
            </Row>
          </Col>
        </Row>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      align: "center",
      render: (member) => {
        if (member.isPending) {
          return (
            <PendingMemberRoleDropwdown
              showLoader
              isHoverEffect
              placement="bottomLeft"
              isCurrentUserAdmin={isLoggedInUserAdmin}
              isAdmin={member.isAdmin}
              isLoggedInUserAdmin={isLoggedInUserAdmin}
              inviteId={member?.inviteId}
              fetchTeamMembers={fetchTeamMembers}
            />
          );
        }

        return member.isOwner ? (
          <span>
            <Badge status="success" /> Owner
          </span>
        ) : (
          <MemberRoleDropdown
            showLoader
            isHoverEffect={isLoggedInUserAdmin || member.id === loggedInUserId}
            placement="bottomLeft"
            isAdmin={member.isAdmin}
            memberId={member.id}
            isPending={member.isPending}
            loggedInUserId={loggedInUserId}
            isLoggedInUserAdmin={isLoggedInUserAdmin}
            handleRemoveMember={() =>
              setDeleteUserModal({
                ...deleteUserModal,
                isActive: true,
                userId: member.id,
              })
            }
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
        redirectToMyTeams(navigate);
      });

    getPendingUsers({
      teamId: teamId,
    })
      .then((res) => {
        if (!mountedRef.current) return null;
        const response = res.data;
        if (response.success) {
          setPendingMembers(response.users);
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
        setIsTeamPlanActive(response.subscriptionStatus === APP_CONSTANTS.SUBSCRIPTION_STATUS.ACTIVE);
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

    const currentUser = members.filter((member) => member.id === loggedInUserId);

    const otherMembers = members.filter((member) => member.id !== loggedInUserId);

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
    if (user.details.isLoggedIn) {
      stableFetchTeamSubscriptionStatus();
    }
  }, [user, stableFetchTeamSubscriptionStatus, teamId, isTeamPlanActive]);

  return (
    <>
      {/* Since members array can never be empty in any case, we can use it to show/hide loader */}
      {isEmpty(members) ? renderLoader() : renderTable()}

      <RemoveUserModal
        teamId={teamId}
        isOpen={deleteUserModal.isActive}
        toggleModal={toggleDeleteUserModal}
        userId={deleteUserModal.userId}
        callbackOnSuccess={modifyMembersCallback}
      />

      <ContactUsModal isOpen={contactUsModal} toggleModal={toggleContactUsModal} />
    </>
  );
};

export default TeamMembersTable;
