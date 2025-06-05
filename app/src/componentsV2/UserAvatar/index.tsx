import { useSelector } from "react-redux";
import { Tooltip, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import { getActiveWorkspacesMembers } from "store/slices/workspaces/selectors";

interface UserIconProps {
  uid?: string;
}

export const UserAvatar = ({ uid }: UserIconProps) => {
  const activeWorkspaceMembers = useSelector(getActiveWorkspacesMembers);

  if (uid && activeWorkspaceMembers[uid])
    return (
      <>
        <Tooltip title={activeWorkspaceMembers[uid]?.displayName}>
          <Avatar size={24} src={activeWorkspaceMembers[uid]?.photoUrl} />
        </Tooltip>
      </>
    );
  else if (uid) {
    return (
      <Tooltip title={`uid=${uid}`}>
        <Avatar size={22} icon={<UserOutlined />} />
      </Tooltip>
    );
  } else {
    return (
      <Tooltip title="Anonymous">
        <Avatar size={22} icon={<UserOutlined />} />
      </Tooltip>
    );
  }
};
