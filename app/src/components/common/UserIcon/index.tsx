import { useSelector } from "react-redux";
import { getCurrentlyActiveWorkspaceMembers } from "store/features/teams/selectors";
import { Tooltip, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";

interface UserIconProps {
  uid?: string;
}

export const UserIcon = ({ uid }: UserIconProps) => {
  const currentlyActiveWorkspaceMembers = useSelector(getCurrentlyActiveWorkspaceMembers);

  if (uid && currentlyActiveWorkspaceMembers[uid])
    return (
      <>
        <Tooltip title={currentlyActiveWorkspaceMembers[uid]?.displayName}>
          <Avatar size={24} src={currentlyActiveWorkspaceMembers[uid]?.photoUrl} />
        </Tooltip>
      </>
    );
  else
    return (
      <Tooltip title="Anonymous">
        <Avatar size={22} icon={<UserOutlined />} />
      </Tooltip>
    );
};
