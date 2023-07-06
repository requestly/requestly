import React, { useEffect, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Col, Spin, Row } from "antd";
import { CloseCircleOutlined, LoadingOutlined } from "@ant-design/icons";
import isEmpty from "is-empty";
//SUB COMPONENTS
import SharedListViewerTableContainer from "../SharedListViewerTableContainer";
// storageService
import { StorageService } from "../../../../init";
// Reducer Actions
import { actions } from "../../../../store";
//ACTIONS
import { getSharedListIdFromURL, fetchSharedListData } from "./actions";
import { getAppMode, getIsRefreshRulesPending, getUserAuthDetails } from "../../../../store/selectors";
//CONSTANTS
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import "./sharedListViewerIndexPage.css";
import APP_CONSTANTS from "config/constants";
import { AUTH } from "modules/analytics/events/common/constants";
import Logger from "lib/logger";

const SharedListViewerIndexPage = () => {
  //Global State
  const dispatch = useDispatch();
  const isRulesListRefreshPending = useSelector(getIsRefreshRulesPending);
  const appMode = useSelector(getAppMode);
  const user = useSelector(getUserAuthDetails);

  //Component State
  const [rulesFromSharedList, setRulesFromSharedList] = useState([]);
  const [groupsFromSharedList, setGroupsFromSharedList] = useState([]);
  const [sharedListPresent, setSharedListPresent] = useState(true);
  const [isDataLoading, setDataLoading] = useState(true);

  const stableDispatch = useCallback(dispatch, [dispatch]);

  const sharedListId = getSharedListIdFromURL(window.location.pathname);

  useEffect(() => {
    Logger.log("Reading storage (groups) in SharedListViewerIndexPage");
    const groupsPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.GROUP);
    Logger.log("Reading storage (rules) in SharedListViewerIndexPage");
    const rulesPromise = StorageService(appMode).getRecords(GLOBAL_CONSTANTS.OBJECT_TYPES.RULE);

    Promise.all([groupsPromise, rulesPromise]).then((data) => {
      const groups = data[0];
      const rules = data[1];

      stableDispatch(actions.updateRulesAndGroups({ rules, groups }));
    });
  }, [stableDispatch, isRulesListRefreshPending, appMode]);

  const updateCollection = () => {
    fetchSharedListData(sharedListId).then((incomingData) => {
      if (incomingData !== null) {
        setRulesFromSharedList(incomingData.rules || []);
        setGroupsFromSharedList(incomingData.groups || []);
        setDataLoading(false);
      } else {
        setSharedListPresent(false);
        setDataLoading(false);
      }
    });
  };

  const stableUpdateCollection = useCallback(updateCollection, [sharedListId]);

  const promptUserToSignup = (source) => {
    dispatch(
      actions.toggleActiveModal({
        modalName: "authModal",
        newValue: true,
        newProps: {
          redirectURL: window.location.href,
          authMode: APP_CONSTANTS.AUTH.ACTION_LABELS.SIGN_UP,
          eventSource: source,
        },
      })
    );
  };

  useEffect(() => {
    stableUpdateCollection();
  }, [stableUpdateCollection]);

  const loaderIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />;

  return (
    <React.Fragment>
      {isDataLoading ? (
        <Row type="flex" align="middle" justify="center">
          <Col>
            <Spin indicator={loaderIcon} />
          </Col>
        </Row>
      ) : sharedListPresent && !isEmpty(rulesFromSharedList) ? (
        <SharedListViewerTableContainer id={sharedListId} rules={rulesFromSharedList} groups={groupsFromSharedList} />
      ) : (
        <Row className="sharedList-viewer-error-wrapper" type="flex" align="middle" justify="center">
          <Col className="sharedList-viewer-error-message">
            <h1>
              <CloseCircleOutlined className="error-icon" />
            </h1>
            {!user.loggedIn ? (
              <>
                <h2>This list is private. Please login to access it</h2>
                <button
                  className="ant-btn ant-btn-primary"
                  onClick={() => promptUserToSignup(AUTH.SOURCE.ACCESS_SHARED_LIST)}
                >
                  Login
                </button>
              </>
            ) : (
              <>
                <h2>Either you don’t have permission to access this shared list or this URL is invalid</h2>
                <p>
                  <a href="/">Go To Rules</a>
                </p>
              </>
            )}
          </Col>
        </Row>
      )}
    </React.Fragment>
  );
};
export default SharedListViewerIndexPage;
