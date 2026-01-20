import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tag } from "antd";
import { isEqual } from "lodash";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { toast } from "utils/Toast";
import { createResponseRule, updateResponseRule } from "../../../../../../features/rules/RuleBuilder/actions/utils";
import AppliedRules from "../Tables/columns/AppliedRules";
import JsonPreview from "./JsonPreview";
import { getAppMode } from "store/selectors";

const JSON_CONTENT_TYPE = "application/json";

const RequestBodyPreview = ({ data, type, url, actions, log_id, upsertRequestAction }) => {
  const dispatch = useDispatch();
  //Global State
  const appMode = useSelector(getAppMode);

  // Making it always true for now, as jsoneditor doesn't support dynamic onEditable
  // https://github.com/josdejong/jsoneditor/issues/1386
  const [updateAllowed, setUpdateAllowed] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [currentData, setCurrentData] = useState(data);
  const [modifiedData, setModifiedData] = useState(data);

  const filterResponseActions = () => {
    return actions.filter((action) => action.rule_type === GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE);
  };

  const createResponseAction = (rule_id) => {
    let action = {
      rule_type: GLOBAL_CONSTANTS.RULE_TYPES.RESPONSE,
      rule_id: rule_id,
      // No need to add rest of the action
    };
    return action;
  };

  const saveModifications = () => {
    const responseActions = filterResponseActions(actions);
    if (responseActions.length === 0) {
      const rule = createResponseRule(appMode, url, modifiedData);
      upsertRequestAction(log_id, createResponseAction(rule.id));
      toast.success("Rule Created Successfully");
    } else {
      updateResponseRule(appMode, responseActions[0].rule_id, url, modifiedData, dispatch);
      toast.success("Rule Modified Successfully");
    }
    // setUpdateAllowed(false);
    setIsUpdating(false);
  };

  const cancelModifications = () => {
    setCurrentData(data);
    // setUpdateAllowed(false);
    setIsUpdating(false);
  };

  /**
   * The data passed in the props updates perfectly as updated
   * But for some reason this does not update currentData
   *
   * So the following useEffect is used to set the currentData to
   * the latest version of data
   *
   * We avoid updating currentData while isUpdating is true
   * so as to avoid loosing ungoing modification
   */
  useEffect(() => {
    if (!isEqual(currentData, data) && !isUpdating) {
      setCurrentData(data);
      setModifiedData(data);
    }
  }, [data, isUpdating, currentData]);

  /**
   * As mentioned in JsonPreview.js
   * modifiedData and currentData need to tracked
   * since JsonEditor is buggy
   *
   * This isUpdating is true when
   * modifiedData != currentData
   */
  useEffect(() => {
    if (isEqual(currentData, modifiedData)) {
      setIsUpdating(false);
    } else {
      setIsUpdating(true);
    }
  }, [setIsUpdating, modifiedData, currentData]);

  const renderAppliedRules = () => {
    const responseActions = filterResponseActions(actions);

    if (responseActions && responseActions.length > 0) {
      return (
        <Tag color="green">
          Modified By&nbsp;
          <AppliedRules actions={filterResponseActions(actions)} />
        </Tag>
      );
    }

    return null;
  };

  const renderUpdateButtons = () => {
    let buttons = null;

    if (updateAllowed) {
      buttons = (
        <>
          <Button
            type="primary"
            style={{ marginRight: 8 }}
            disabled={!isUpdating || !isValid}
            onClick={() => {
              saveModifications(false);
            }}
          >
            Save
          </Button>
          <Button
            type="danger"
            style={{ marginRight: 8 }}
            onClick={() => {
              cancelModifications();
            }}
          >
            Cancel
          </Button>
        </>
      );
    } else {
      buttons = (
        <Button
          type="primary"
          onClick={() => {
            setUpdateAllowed(true);
          }}
          style={{ marginRight: 8 }}
        >
          Modify Response
        </Button>
      );
    }

    return (
      <div style={{ position: "absolute", bottom: 20 }}>
        {buttons}
        {renderAppliedRules()}
      </div>
    );
  };

  if (!data) {
    return <h3>Preview not available</h3>;
  }

  const cleanedType = type ? type.replace(/\s+/g, "").toLowerCase() : "";
  if (cleanedType.includes(JSON_CONTENT_TYPE)) {
    return (
      <>
        {renderUpdateButtons()}
        <JsonPreview
          data={currentData}
          updateAllowed={updateAllowed}
          setModifiedData={setModifiedData}
          setIsValid={setIsValid}
        />
        {renderUpdateButtons()}
      </>
    );
  }

  return <h3>Preview not available</h3>;
};

export default RequestBodyPreview;
