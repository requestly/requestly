import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspaceMembers } from "store/features/teams/selectors";
import { Tooltip, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface UserIconProps {
  uid?: string;
}

export const UserAvatar = ({ uid }: UserIconProps) => {
  const currentlyActiveWorkspaceMembers = useSelector(getCurrentlyActiveWorkspaceMembers);

  if (uid && currentlyActiveWorkspaceMembers[uid])
    return (
      <>
        <Tooltip title={currentlyActiveWorkspaceMembers[uid]?.displayName}>
          <Avatar size={24} src={currentlyActiveWorkspaceMembers[uid]?.photoUrl} />
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
