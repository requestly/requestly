import React from "react";
import { useNavigate } from "react-router-dom";
import { Button, Tag } from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import ProTable from "@ant-design/pro-table";
import { redirectToTeam } from "../../../../../../utils/RedirectionUtils";
import { trackCreateNewTeamClicked } from "modules/analytics/events/common/teams";
import { useSelector } from "react-redux";
import { globalActions } from "store/slices/global/slice";
import { useDispatch } from "react-redux";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";

const TeamsList = ({ teams = [] }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);

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

          {activeWorkspaceId === record.id ? (
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
              trackCreateNewTeamClicked("my_teams");
              dispatch(
                globalActions.toggleActiveModal({
                  modalName: "createWorkspaceModal",
                  newValue: true,
                  newProps: { source: "my_teams" },
                })
              );
            }}
            icon={<PlusOutlined />}
          >
            Create New Workspace
          </Button>,
        ]}
      />
    </>
  );
};

export default TeamsList;
