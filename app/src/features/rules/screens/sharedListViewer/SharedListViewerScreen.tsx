import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { Col, Row } from "antd";
import { SharedListsContentHeader } from "./components/SharedListViewerContentHeader/SharedListViewerContentHeader";
import { useFetchSharedListData } from "./hooks/useFetchSharedListData";
import { getFilterSharedListRecords } from "./utils";
import { getSharedListIdFromURL } from "features/rules/screens/sharedLists/utils";
import { SharedListViewerList } from "./components/SharedListViewerList/SharedListViewerList";
import PageLoader from "components/misc/PageLoader";
import { isEmpty } from "lodash";
import { CloseCircleOutlined } from "@ant-design/icons";
import { SOURCE } from "modules/analytics/events/common/constants";
import { globalActions } from "store/slices/global/slice";
import APP_CONSTANTS from "config/constants";
import PATHS from "config/constants/sub/paths";
import "./sharedListViewerScreen.css";
import { ContentListScreen } from "componentsV2/ContentList";
import { RQButton } from "lib/design-system-v2/components";
import { trackLoginButtonClicked } from "modules/analytics/events/common/auth/login";

export const SharedListViewerScreen = () => {
  const sharedListId = getSharedListIdFromURL(window.location.pathname);
  const {
    isLoading,
    sharedListGroups,
    sharedListRules,
    isSharedListPresent,
    sharedListRecordsMap,
    isDeleted,
  } = useFetchSharedListData({
    sharedListId,
  });
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const [searchValue, setSearchValue] = useState("");

  const filteredRecords = useMemo(() => {
    return getFilterSharedListRecords([...sharedListGroups, ...sharedListRules], searchValue);
  }, [searchValue, sharedListGroups, sharedListRules]);

  const promptUserToSignIn = (source: string) => {
    trackLoginButtonClicked(SOURCE.SHARED_LIST_SCREEN);
    dispatch(
      globalActions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.LOG_IN,
          eventSource: source,
        },
      })
    );
  };

  if (isLoading) {
    return <PageLoader message="Loading shared list..." />;
  }

  if (isSharedListPresent && !isEmpty(sharedListRules) && !isDeleted) {
    return (
      <ContentListScreen>
        <SharedListsContentHeader
          searchValue={searchValue}
          handleSearchValueUpdate={(value: string) => setSearchValue(value)}
          sharedListGroups={sharedListGroups}
          sharedListRules={sharedListRules}
          sharedListId={sharedListId}
        />
        <SharedListViewerList records={filteredRecords} recordsMap={sharedListRecordsMap} isLoading={isLoading} />
      </ContentListScreen>
    );
  } else {
    return (
      <Row className="sharedList-viewer-error-wrapper" align="middle" justify="center">
        <Col className="sharedList-viewer-error-message">
          <h1>
            <CloseCircleOutlined className="error-icon" />
          </h1>
          {!user.loggedIn ? (
            <>
              <h2>This list is private. Please sign in to access it</h2>
              <RQButton onClick={() => promptUserToSignIn(SOURCE.ACCESS_SHARED_LIST)}>Sign in</RQButton>
            </>
          ) : (
            <>
              <h2>Either you don’t have permission to access this shared list or this URL is invalid</h2>
              <p>
                <a href={PATHS.RULES.MY_RULES.ABSOLUTE}>Go To Rules</a>
              </p>
            </>
          )}
        </Col>
      </Row>
    );
  }
};
