import { workspaceManager } from "../helpers/workspaceManager";
import { useDispatch, useSelector } from "react-redux";
import { trackWorkspaceSwitched } from "modules/analytics/events/common/teams";
import { variablesActions } from "store/features/variables/slice";
import { getPersonalWorkspaceId } from "../utils";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { tabsLayoutActions } from "store/slices/tabs-layout";
import { redirectToWebAppHomePage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";

export const useWorkspaceHelpers = () => {
  const dispatch = useDispatch();
  const userId = useSelector(getUserAuthDetails)?.details?.profile?.uid;
  const navigate = useNavigate();

  const switchToPersonalWorkspace = async () => {
    return switchWorkspace(getPersonalWorkspaceId(userId));
  };

  const switchWorkspace = async (workspaceId?: string, source?: string) => {
    if (!workspaceId) {
      console.error("Invalid workspaceId while switching", { workspaceId });
    }

    redirectToWebAppHomePage(navigate);
    trackWorkspaceSwitched(source);
    console.log("[useWorkspaceHelpers.switchWorkspace]", { workspaceId });
    dispatch(variablesActions.resetState());
    dispatch(tabsLayoutActions.resetState());
    return workspaceManager.initActiveWorkspaces([workspaceId]);
  };

  return { switchWorkspace, switchToPersonalWorkspace };
};
