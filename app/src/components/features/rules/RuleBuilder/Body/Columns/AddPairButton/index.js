import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "antd";
//ACTIONS
import { addEmptyPair } from "./actions";
//UTILITIES
import { getCurrentlySelectedRuleData } from "../../../../../../../store/selectors";
import { trackRQLastActivity } from "../../../../../../../utils/AnalyticsUtils";
//CONSTANTS
import { PlusOutlined } from "@ant-design/icons";
import { trackRulePairCreated } from "modules/analytics/events/common/rules";
import "./AddPairButton.css";

const AddPairButton = (props) => {
  const { currentlySelectedRuleConfig } = props;

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);

  //STATE TO MAINTAIN CURRENTLY SELECTED RULE PAIR COUNT
  const [currentlySelectedRuleCount, setCurrentlySelectedRuleCount] = useState(
    0
  );

  //TO SET CURRENTLY OPENED RULE - PAIRS COUNT
  useEffect(() => {
    setCurrentlySelectedRuleCount(currentlySelectedRuleData.pairs.length);
  }, [currentlySelectedRuleData]);

  const handleRulePairsOnClick = () => {
    addEmptyPair(
      currentlySelectedRuleData,
      currentlySelectedRuleConfig,
      dispatch
    );
    trackRQLastActivity("rule_pair_created");
    trackRulePairCreated({ current_pairs_count: currentlySelectedRuleCount });
  };

  return (
    <Button
      block
      type="dashed"
      className="add-pair-btn"
      onClick={handleRulePairsOnClick}
      icon={<PlusOutlined />}
    >
      <span className="shrink-0">Add a new condition</span>
    </Button>
  );
};

export default AddPairButton;
