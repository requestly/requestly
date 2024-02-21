import React, { useEffect, useState } from "react";
import {
  fetchSharedListData,
  getSharedListIdFromString,
} from "components/features/sharedLists/SharedListViewerIndexPage/actions";
import { StorageRecord } from "features/rules/types/rules";
import { useParams } from "react-router-dom";
import RulesTable from "features/rules/components/RulesList/components/RulesTable/RulesTable";
import ContentHeader from "componentsV2/ContentHeader";

interface Props {}

const SharedListViewer: React.FC<Props> = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [storageRecords, setStorageRecords] = useState<StorageRecord[]>([]);
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
        const sharedListRecords = [...rules, ...groups];
        console.log({ sharedListRecords });
        setStorageRecords(sharedListRecords);

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
      <RulesTable records={storageRecords} loading={isLoading} searchValue="" />
    </>
  );
};

export default SharedListViewer;
