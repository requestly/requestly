import { useEffect, useState } from "react";

import {
  fetchSharedListData,
  getSharedListIdFromString,
} from "components/features/sharedLists/SharedListViewerIndexPage/actions";
import { RuleObj } from "features/rules/types/rules";
import { useParams } from "react-router-dom";
import ContentHeader from "componentsV2/ContentHeader/ContentHeader";
import RulesTable from "features/rules/components/RulesList/components/RulesTable/RulesTable";

interface Props {}

const SharedListViewer = ({}: Props) => {
  const [isLoading, setIsLoading] = useState(false);
  const [ruleObjs, setRuleObjs] = useState<RuleObj[]>([]);
  const { sharedListParam } = useParams();
  const sharedListId = sharedListParam ? getSharedListIdFromString(sharedListParam) : null;
  console.log({ sharedListParam, sharedListId });

  // FIXME: Move this to SharedListIndex and pass as Props
  useEffect(() => {
    fetchSharedListData(sharedListId).then((incomingData) => {
      setIsLoading(true);

      if (incomingData !== null) {
        const rules = incomingData.rules || [];
        const groups = incomingData.groups || [];
        const sharedListRuleObjs = [...rules, ...groups];
        console.log({ sharedListRuleObjs });
        setRuleObjs(sharedListRuleObjs);

        setIsLoading(false);
      } else {
        // TODO: Add logic for Shared List 404
        // setSharedListPresent(false);
        setIsLoading(false);
      }
    });
  }, [sharedListId]);

  return (
    <>
      {/* TODO: Add Modals Required in Shared List rules here. Eg. Rule Viewer Modal */}
      <ContentHeader title="SharedList" subtitle="Share Rules" actions={[]} />
      <RulesTable rules={ruleObjs as RuleObj[]} loading={isLoading} />
    </>
  );
};

export default SharedListViewer;
