import React from "react";
import RequestSourceRow from "../Rows/RowsMarkup/RequestSourceRow";
import { MoreInfo } from "components/misc/MoreInfo";
import { useSelector } from "react-redux";
import { getCurrentlySelectedRuleData } from "store/selectors";

const CancelRulePair = ({ isSuperRule, ruleId, pair, pairIndex, ruleDetails, isInputDisabled }) => {
  const currentlySelectedRuleData = useSelector(getCurrentlySelectedRuleData);
  const cancelRulePair = !isSuperRule
    ? pair
    : {
        ...(currentlySelectedRuleData?.rules?.[ruleId]?.pairs[0] ?? {}),
        source: { ...currentlySelectedRuleData?.pairs?.[0]?.source },
      };

  return isSuperRule ? (
    <div>
      <RequestSourceRow
        rowIndex={1}
        pair={cancelRulePair}
        pairIndex={pairIndex}
        ruleDetails={ruleDetails}
        isInputDisabled={true}
      />
    </div>
  ) : (
    <RequestSourceRow
      rowIndex={1}
      pair={pair}
      pairIndex={pairIndex}
      ruleDetails={ruleDetails}
      isInputDisabled={isInputDisabled}
    />
  );
};

export default CancelRulePair;
