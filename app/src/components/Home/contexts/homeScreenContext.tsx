import React, { createContext, useContext, useEffect, useState } from "react";
import { isExtensionInstalled } from "actions/ExtensionActions";
import { useHasChanged } from "hooks";
import { useSelector } from "react-redux";
import { getAppMode, getIsRulesListLoading } from "store/selectors";
import { getUserAuthDetails } from "store/slices/global/user/selectors";
import { getActiveWorkspaceId } from "store/slices/workspaces/selectors";
import { RecordType, Rule } from "@requestly/shared/types/entities/rules";
import { useTabServiceWithSelector } from "componentsV2/Tabs/store/tabServiceStore";
import { useFetchMockRecords } from "features/mocks/screens/mocksList/components/MocksList/hooks/useFetchMockRecords";
import { MockType, RQMockMetadataSchema } from "components/features/mocksV2/types";
import * as Sentry from "@sentry/react";
import clientRuleStorageService from "services/clientStorageService/features/rule";

interface HomeScreenContextInterface {
  // rules
  rules: Rule[];
  isRulesLoading: boolean;
  isAnyRecordExist: boolean;

  // mocks
  isFetchingMocks: boolean;
  mockRecords: RQMockMetadataSchema[];
}

const HomeScreenContext = createContext<HomeScreenContextInterface>({
  rules: [],
  isRulesLoading: false,
  isAnyRecordExist: false,

  isFetchingMocks: false,
  mockRecords: [],
});

interface HomeScreenProviderProps {
  children: React.ReactElement;
}

export const HomeScreenProvider: React.FC<HomeScreenProviderProps> = ({ children }) => {
  const appMode = useSelector(getAppMode);
  const activeWorkspaceId = useSelector(getActiveWorkspaceId);
  const user = useSelector(getUserAuthDetails);
  const isRulesListLoading = useSelector(getIsRulesListLoading);
  const hasUserChanged = useHasChanged(user?.details?.profile?.uid);
  const [rules, setRules] = useState<Rule[]>([]);
  const [isRulesLoading, setIsRulesLoading] = useState(true);
  const [tabs] = useTabServiceWithSelector((state) => [state.tabs]);
  const { isLoading: isFetchingMocks, mockRecords } = useFetchMockRecords(MockType.API, false);

  useEffect(() => {
    if (isExtensionInstalled() && !isRulesListLoading) {
      clientRuleStorageService
        .getRecordsByObjectType(RecordType.RULE)
        .then((rules) => {
          setRules(rules);
        })
        .catch((e) => {
          Sentry.captureException(new Error("Failed to fetch rules from storage"), {
            extra: {
              storageServiceError: e,
            },
          });
        })
        .finally(() => {
          setIsRulesLoading(false);
        });
    } else {
      setIsRulesLoading(false);
    }
  }, [appMode, activeWorkspaceId, hasUserChanged, isRulesListLoading]);

  const isAnyRecordExist = rules.length > 0 || tabs.size > 0 || mockRecords.length > 0;
  const value = {
    rules,
    isRulesLoading: isRulesLoading || isRulesListLoading,
    isAnyRecordExist,
    isFetchingMocks,
    mockRecords,
  };

  return <HomeScreenContext.Provider value={value}>{children}</HomeScreenContext.Provider>;
};

export const useHomeScreenContext = () => useContext(HomeScreenContext);
