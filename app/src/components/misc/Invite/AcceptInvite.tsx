import { Avatar, Col, Row } from "antd";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQButton } from "lib/design-system/components";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getUniqueColorForWorkspace } from "utils/teams";
import { toast } from "utils/Toast";
import "./index.css";
import { redirectToTeam } from "utils/RedirectionUtils";
import { switchWorkspace } from "actions/TeamWorkspaceActions";
import { useDispatch, useSelector } from "react-redux";
import { getAppMode, getUserAuthDetails } from "store/selectors";
import { getIsWorkspaceMode } from "store/features/teams/selectors";

interface Props {
    inviteId: string;
    ownerName: string;
    workspaceName: string;
    invitedEmail: string;
}

const AcceptInvite = ({ inviteId, ownerName, workspaceName, invitedEmail }: Props) => {
    const navigate = useNavigate();
    const  dispatch = useDispatch();
    const user = useSelector(getUserAuthDetails);
    const appMode = useSelector(getAppMode);
    const isWorkspaceMode = useSelector(getIsWorkspaceMode);

    const [ inProgress, setInProgress ] = useState(false);

    const handleAcceptInvitation = () => {
        const functions = getFunctions();
        const acceptInvite = httpsCallable(functions, "invites-acceptInvite");

        setInProgress(true);
        acceptInvite({ inviteId })
            .then((res: any) => {
                console.log(res);
                if(res?.data?.success) {
                    toast.success("Successfully accepted invite");

                    if(res?.data?.data?.invite.type === "teams") {
                        switchWorkspace(
                            {
                              teamId: res?.data?.data?.invite?.metadata?.teamId,
                              teamName: res?.data?.data?.invite?.metadata?.teamName,
                              teamMembersCount: 1,
                            },
                            dispatch,
                            {
                              isSyncEnabled: user?.details?.isSyncEnabled,
                              isWorkspaceMode,
                            },
                            appMode
                        );
                        redirectToTeam(navigate, res?.data?.data?.invite?.metadata?.teamId, {
                            state: {
                                isNewTeam: false,
                            },
                        });
                    }
                }
                setInProgress(false);
            }).catch((err) => {
                toast.error("Error while accepting invitation. Please contact workspace admin");
                setInProgress(false);
            })
    }

    return (
        <Row className="invite-container" justify={"center"}>
            <Col
                xs={18}
                sm={16}
                md={14}
                lg={12}
                xl={8}
            >
                <div className="invite-content">
                    <div className="workspace-image">
                        <Avatar
                            size={56}
                            shape="square"
                            icon={workspaceName ? workspaceName?.[0]?.toUpperCase() : "P"}
                            style={{
                                backgroundColor: `${getUniqueColorForWorkspace(
                                    "",
                                    workspaceName,
                                )}`,
                            }}
                        />
                    </div>
                    <div className="header invite-header">
                        {ownerName} has invited you to workspace {workspaceName}
                    </div>
                    <p className="text-gray invite-subheader">
                        You are invited to the Requestly Workspace <b>{workspaceName}</b>
                    </p>
                    {
                        inProgress?
                        (<RQButton loading={true} className="invite-modal-button" type="primary" size="large">Accepting Invitation</RQButton>):
                        (<RQButton className="invite-modal-button" type="primary" size="large" onClick={handleAcceptInvitation}>Accept Invitation</RQButton>)
                    }
                </div>
            </Col>
        </Row>
    );
};

export default AcceptInvite;
