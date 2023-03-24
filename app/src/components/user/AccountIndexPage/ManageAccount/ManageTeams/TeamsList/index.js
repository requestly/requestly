import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Badge, Space, Tag } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import { redirectToTeam } from "../../../../../../utils/RedirectionUtils";
import CreateWorkspaceModal from "../CreateWorkspaceModal";
import { trackCreateNewWorkspaceClicked } from "modules/analytics/events/common/teams";
import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspace } from "store/features/teams/selectors";

const TeamsList = ({ teams = [] }) => {
  const navigate = useNavigate();
  const currentlyActiveWorkspace = useSelector(getCurrentlyActiveWorkspace);
  // Component State
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);

  const toggleCreateTeamModal = () => {
    setIsCreateTeamModalOpen(!isCreateTeamModalOpen);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const renderSubscriptionStatus = (subscriptionStatus, teamId) => {
    switch (subscriptionStatus) {
      case "active":
        return (
          <span
            style={{ width: "300px" }}
            onClick={() => redirectToTeam(navigate, teamId)}
          >
            <Badge status="success" /> Active
          </span>
        );

      case "incomplete":
      case "canceled":
        return (
          <Button
            color="primary"
            size="sm"
            type="button"
            onClick={() => redirectToTeam(navigate, teamId)}
          >
            <span>Pay now</span>
          </Button>
        );

      default:
        return (
          <span style={{ width: "300px" }}>
            <Badge status="error" /> Inactive
          </span>
        );
    }
  };

  const columns = [
    {
      title: "Workspace",
      dataIndex: "name",
      render: (_, record) => (
        <>
          <span
            onClick={() => {
              redirectToTeam(navigate, record.id, {
                redirectBackToMyTeams: true,
              });
            }}
            style={{
              cursor: "pointer",
            }}
          >
            {_}
          </span>

          {currentlyActiveWorkspace.id === record.id ? (
            <Tag style={{ marginLeft: "1em" }} color="green">
              Current
            </Tag>
          ) : null}
        </>
      ),
    },
    {
      title: "Members",
      dataIndex: "accessCount",
    },
    {
      title: "Admins",
      dataIndex: "adminCount",
    },
    {
      title: "Subscription",
      render: (_, record) => {
        return renderSubscriptionStatus(record.subscriptionStatus, record.id);
      },
    },
    {
      title: "Actions",
      align: "right",
      render: (_, record) => (
        <span
          style={{ width: "300px", cursor: "pointer" }}
          onClick={() => {
            redirectToTeam(navigate, record.id);
          }}
        >
          <EditOutlined />
        </span>
      ),
    },
  ];

  const getDataSource = () => {
    const dataSource = [];
    if (teams) {
      Object.keys(teams).forEach((teamId) => {
        dataSource.push({
          id: teamId,
          ...teams[teamId],
        });
      });
    }
    return dataSource;
  };

  return (
    <>
      <ProTable
        rowKey="id"
        pagination={false}
        options={false}
        search={false}
        dateFormatter={false}
        columns={columns}
        dataSource={getDataSource()}
        headerTitle="My Team Workspaces"
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              trackCreateNewWorkspaceClicked("my_teams");
              setIsCreateTeamModalOpen(true);
            }}
            icon={<PlusOutlined />}
          >
            Create New Workspace
          </Button>,
        ]}
      />

      <CreateWorkspaceModal
        isOpen={isCreateTeamModalOpen}
        handleModalClose={toggleCreateTeamModal}
      />
    </>
  );
};

export default TeamsList;
