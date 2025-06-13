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
import { PremiumFeature } from "features/pricing";
import { trackRulePairCreated, trackRulePairCreationAttempted } from "modules/analytics/events/common/rules";
import { RULES_WITHOUT_LIMITS } from "features/rules";
import "./AddPairButton.css";

// TODO: fix prop types
const AddPairButton: React.FC<any> = (props) => {
  const { disabled = false, currentlySelectedRuleConfig } = props;

  //Global State
  const dispatch = useDispatch();
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const { getFeatureLimitValue } = useFeatureLimiter();

  const isRuleHasNoLimits = RULES_WITHOUT_LIMITS.includes(currentlySelectedRuleConfig.TYPE);
  const isPremiumFeature = !getFeatureLimitValue(
    isRuleHasNoLimits ? FeatureLimitType.free : FeatureLimitType.add_new_rule_pair
  );

  //STATE TO MAINTAIN CURRENTLY SELECTED RULE PAIR COUNT
  const [currentlySelectedRuleCount, setCurrentlySelectedRuleCount] = useState(0);

  //TO SET CURRENTLY OPENED RULE - PAIRS COUNT
  useEffect(() => {
    setCurrentlySelectedRuleCount(currentlySelectedRuleData.pairs?.length ?? 0);
  }, [currentlySelectedRuleData]);

  const handleRulePairsOnClick = () => {
    addEmptyPair(currentlySelectedRuleData, currentlySelectedRuleConfig, dispatch);
    trackRQLastActivity("rule_pair_created");
    trackRulePairCreated({
      current_pairs_count: currentlySelectedRuleCount,
      rule_type: currentlySelectedRuleData.ruleType,
    });
  };

  return (
    <PremiumFeature
      popoverPlacement="top"
      onContinue={handleRulePairsOnClick}
      features={[isRuleHasNoLimits ? FeatureLimitType.free : FeatureLimitType.add_new_rule_pair]}
      featureName="Multiple rule pairs"
      source="add_new_rule_pair"
      onClickCallback={() => trackRulePairCreationAttempted(currentlySelectedRuleData.ruleType)}
    >
      <Button disabled={disabled} block type="dashed" className="add-pair-btn" icon={<PlusOutlined />}>
        <span>
          <Row align="middle" wrap={false} className="shrink-0">
            {/* @ts-ignore */}
            Add a new condition{isPremiumFeature ? <PremiumIcon /> : null}
          </Row>
        </span>
      </Button>
    </PremiumFeature>
  );
};

export default AddPairButton;
