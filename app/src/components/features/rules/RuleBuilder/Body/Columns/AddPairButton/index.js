import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Row } from "antd";
import { addEmptyPair } from "./actions";
import { getCurrentlySelectedRuleData } from "../../../../../../../store/selectors";
import { trackRQLastActivity } from "../../../../../../../utils/AnalyticsUtils";
import { PlusOutlined } from "@ant-design/icons";
import { useFeatureLimiter } from "hooks/featureLimiter/useFeatureLimiter";
import { FeatureLimitType } from "hooks/featureLimiter/types";
import { PremiumIcon } from "components/common/PremiumIcon";
import { trackRulePairCreated } from "modules/analytics/events/common/rules";
import "./AddPairButton.css";

const AddPairButton = (props) => {
  const { currentlySelectedRuleConfig } = props;

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const { getFeatureLimitValue } = useFeatureLimiter();
  const isPremiumFeature = !getFeatureLimitValue(FeatureLimitType.add_new_rule_pair);

  //STATE TO MAINTAIN CURRENTLY SELECTED RULE PAIR COUNT
  const [currentlySelectedRuleCount, setCurrentlySelectedRuleCount] = useState(0);

  //TO SET CURRENTLY OPENED RULE - PAIRS COUNT
  useEffect(() => {
    setCurrentlySelectedRuleCount(currentlySelectedRuleData.pairs?.length ?? 0);
  }, [currentlySelectedRuleData]);

  const handleRulePairsOnClick = () => {
    addEmptyPair(currentlySelectedRuleData, currentlySelectedRuleConfig, dispatch);
    trackRQLastActivity("rule_pair_created");
    trackRulePairCreated({ current_pairs_count: currentlySelectedRuleCount });
  };

  return (
    <Button block type="dashed" className="add-pair-btn" onClick={handleRulePairsOnClick} icon={<PlusOutlined />}>
      <span>
        <Row align="middle" wrap={false} className="shrink-0">
          Add a new condition
          {isPremiumFeature ? (
            <PremiumIcon featureType="add_new_rule_pair" source={currentlySelectedRuleData?.ruleType} />
          ) : null}
        </Row>
      </span>
    </Button>
  );
};

export default AddPairButton;
