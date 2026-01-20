import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/constants";
import { CheckCircleOutlined, CloseOutlined, DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Popconfirm, Popover, Space, Tooltip, Typography } from "antd";
import { RQButton, RQDropdown, RQInput } from "lib/design-system/components";
import { ImCross } from "@react-icons/all-files/im/ImCross";
import {
  trackMockResponsesCreateRulesClicked,
  trackMockResponsesGraphQLKeyEntered,
  trackMockResponsesRuleCreationFailed,
  trackMockResponsesRuleCreationStarted,
  trackMockResponsesTargetingSelecting,
} from "modules/analytics/events/features/sessionRecording/mockResponseFromSession";
import { redirectToRules } from "utils/RedirectionUtils";
import { toast } from "utils/Toast";
import {
  createResponseMock,
  getOrCreateSessionGroup,
  traverseJsonByPath,
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2/utils";
import { useSelector } from "react-redux";
import { getSessionId, getSessionName } from "store/features/network-sessions/selectors";
import { getAppMode } from "store/selectors";
import { StorageService } from "init";
import Logger from "lib/logger";

const DEFAULT_PAIR_VALUE: GraphQLFilterPair = {
  key: "",
  value: "",
};

interface GraphQLFilterPair {
  key: string;
  value: string;
}

interface Props {
  setMockGraphQLKeys: (value: GraphQLFilterPair[]) => void;
  mockGraphQLKeys: GraphQLFilterPair[];
  mockResourceType: string;
  selectedMockRequests: Record<string, any>;
  resetMockResponseState: () => void;
  setCreateMocksMode: (value: boolean) => void;
  setSelectedMockRequests: (value: Record<string, any>) => void;
}

const CreateMocksModeBanner: React.FC<Props> = ({
  setMockGraphQLKeys,
  mockGraphQLKeys,
  setSelectedMockRequests,
  selectedMockRequests,
  setCreateMocksMode,
  resetMockResponseState,
  mockResourceType,
}) => {
  const navigate = useNavigate();

  const networkSessionId = useSelector(getSessionId);
  const sessionName = useSelector(getSessionName);
  const appMode = useSelector(getAppMode);

  const [isRulesCreated, setIsRulesCreated] = useState(false);
  const [createdGroupName, setCreatedGroupName] = useState("");
  const [createMockLoader, setCreateMockLoader] = useState(false);
  const [graphQLFilterPairs, setGraphQLFilterPairs] = useState<GraphQLFilterPair[]>([{ ...DEFAULT_PAIR_VALUE }]);
  const [mockMatcher, setMockMatcher] = useState<string | null>(null);

  const selectedRequestsLength = useMemo(() => {
    return Object.keys(selectedMockRequests).length;
  }, [selectedMockRequests]);

  const confirmGraphQLPairs = useCallback(
    (pairs: GraphQLFilterPair[]) => {
      if (pairs.length === 0) {
        toast.error("Please add at least one key-value pair to proceed.");
        return;
      }
      if (pairs.some((pair) => !pair.key || !pair.value)) {
        toast.error("Please fill in all the key-value pairs to proceed.");
        return;
      }
      setMockGraphQLKeys(pairs);
      trackMockResponsesGraphQLKeyEntered(pairs);
    },
    [setMockGraphQLKeys]
  );

  const updateGraphQLPairs = useCallback((index: number, selector: "key" | "value", value: string) => {
    setGraphQLFilterPairs((prev) => {
      const updatedSelectors = [...prev];
      updatedSelectors[index][selector] = value;
      return updatedSelectors;
    });
  }, []);

  const removeGraphQLKeyInput = useCallback((index: number) => {
    setGraphQLFilterPairs((prev) => {
      const updatedSelectors = [...prev];
      updatedSelectors.splice(index, 1);
      return updatedSelectors;
    });
  }, []);

  const createMockResponses = useCallback(async () => {
    trackMockResponsesRuleCreationStarted(selectedRequestsLength);

    const { groupId: newSessionGroupId, groupName: newSessionGroupName } = await getOrCreateSessionGroup(
      {
        networkSessionId,
        networkSessionName: sessionName,
      },
      appMode
    );

    const graphQLKeys = mockGraphQLKeys.map((selector) => selector.key);

    const newRules = Object.values(selectedMockRequests).map((log) => {
      return createResponseMock({
        responseDetails: log.response,
        urlMatcher: mockMatcher,
        requestUrl: log.url,
        operationKeys: graphQLKeys,
        requestDetails: log.request,
        resourceType: mockResourceType,
        groupId: newSessionGroupId,
      });
    });

    return StorageService(appMode)
      .saveMultipleRulesOrGroups(newRules)
      .then(() => {
        setIsRulesCreated(true);
        setCreatedGroupName(newSessionGroupName);
      })
      .catch((e) => {
        Logger.log("Error in creating mock rules", e);
        trackMockResponsesRuleCreationFailed(selectedRequestsLength);
      })
      .finally(() => {
        setCreateMockLoader(false);
        setMockMatcher(null);
        setGraphQLFilterPairs([{ ...DEFAULT_PAIR_VALUE }]);
        resetMockResponseState();
      });
  }, [
    appMode,
    mockGraphQLKeys,
    mockMatcher,
    mockResourceType,
    networkSessionId,
    resetMockResponseState,
    selectedMockRequests,
    selectedRequestsLength,
    sessionName,
  ]);

  return (
    <Alert
      type="info"
      banner
      showIcon={false}
      message={
        <div className="display-flex w-100" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div className="w-100">
            {isRulesCreated ? (
              <>
                <CheckCircleOutlined style={{ color: "var(--requestly-color-success)" }} className="mr-4" />
                <span>{`Mock rules have been created successfully in the group: ${createdGroupName}`}</span>
              </>
            ) : selectedRequestsLength === 0 ? (
              <span>
                {mockResourceType === "graphqlApi"
                  ? "Filter GraphQL requests by payload keys and values, then select the requests to be mocked."
                  : "Select the REST/Static requests that you want to mock from the traffic table below."}
              </span>
            ) : (
              <span>{`${selectedRequestsLength} requests selected`}</span>
            )}
          </div>
          <Space direction="horizontal">
            {mockResourceType === "graphqlApi" && !isRulesCreated && (
              <div className="mr-16">
                <Popover
                  trigger={["click"]}
                  content={
                    <Space direction="vertical">
                      <Typography.Text>Specify the keys and values to filter out GraphQL requests</Typography.Text>
                      {graphQLFilterPairs.map((selector, index) => (
                        <Space direction="horizontal" key={index}>
                          <RQInput
                            size="small"
                            onChange={(e) => updateGraphQLPairs(index, "key", e.target.value)}
                            placeholder="Key eg: operationName"
                            className="session-mock-input"
                            value={selector.key}
                          />
                          <RQInput
                            size="small"
                            onChange={(e) => updateGraphQLPairs(index, "value", e.target.value)}
                            placeholder="Value eg: getUserInfo"
                            className="session-mock-input"
                            value={selector.value}
                          />

                          <Popconfirm
                            title={"Clearing the filter will unselect the chosen requests. Do you want to continue?"}
                            onConfirm={() => {
                              removeGraphQLKeyInput(index);

                              //remove the request selection
                              const graphQLPair = { ...graphQLFilterPairs[index] };
                              Object.values(selectedMockRequests).forEach((log) => {
                                const requestData = JSON.parse(log?.request?.body);
                                const valueInRequestData = traverseJsonByPath(requestData, graphQLPair.key);
                                if (valueInRequestData && valueInRequestData === graphQLPair.value) {
                                  setSelectedMockRequests((prev: Record<string, any>) => {
                                    const prevMockRequests = { ...prev };
                                    delete prevMockRequests[log.id];
                                    return prevMockRequests;
                                  });
                                }
                              });
                            }}
                            okText="Yes"
                            cancelText="No"
                            placement="bottom"
                            disabled={
                              (!mockGraphQLKeys[index]?.key && !graphQLFilterPairs[index].key) ||
                              (!mockGraphQLKeys[index]?.value && !graphQLFilterPairs[index].value)
                            }
                          >
                            <div className={"cursor-pointer display-row-center"}>
                              <ImCross
                                className="text-gray icon__wrapper"
                                onClick={() => {
                                  if (
                                    (!mockGraphQLKeys[index]?.key && !graphQLFilterPairs[index].key) ||
                                    (!mockGraphQLKeys[index]?.value && !graphQLFilterPairs[index].value)
                                  ) {
                                    removeGraphQLKeyInput(index);
                                  }
                                }}
                              />
                            </div>
                          </Popconfirm>
                        </Space>
                      ))}
                      <RQButton
                        size="small"
                        type="link"
                        onClick={() => setGraphQLFilterPairs((prev) => [...prev, { ...DEFAULT_PAIR_VALUE }])}
                      >
                        + Add
                      </RQButton>
                      <RQButton
                        type="primary"
                        size="small"
                        onClick={() => {
                          confirmGraphQLPairs(graphQLFilterPairs);
                        }}
                      >
                        Proceed
                      </RQButton>
                    </Space>
                  }
                  placement="bottom"
                  destroyTooltipOnHide
                >
                  <RQButton>Filter GraphQL requests</RQButton>
                </Popover>
              </div>
            )}
            <div>
              {isRulesCreated ? (
                <RQButton type="primary" onClick={() => redirectToRules(navigate)}>
                  View Rules
                </RQButton>
              ) : (
                <Popconfirm
                  icon={<InfoCircleOutlined />}
                  title={
                    <Space direction="vertical">
                      <div>
                        {`Create rules for the ${selectedRequestsLength} selected ${
                          selectedRequestsLength > 1 ? "requests" : "request"
                        }?`}
                      </div>
                      <RQDropdown
                        menu={{
                          items: [
                            {
                              key: GLOBAL_CONSTANTS.RULE_KEYS.URL,
                              label: (
                                <Tooltip
                                  title="Ideal for targeting specific and complete URLs."
                                  placement="right"
                                  zIndex={30000}
                                >
                                  Match entire URL
                                </Tooltip>
                              ),
                            },
                            {
                              key: GLOBAL_CONSTANTS.RULE_KEYS.PATH,
                              label: (
                                <Tooltip
                                  title="Ideal for matching across different domains"
                                  placement="right"
                                  zIndex={30000}
                                >
                                  Match only path
                                </Tooltip>
                              ),
                            },
                            {
                              key: "path_query",
                              label: (
                                <Tooltip
                                  title="Ideal for cases where param values in URL are crucial for matching"
                                  placement="right"
                                  zIndex={30000}
                                >
                                  Match path & query params
                                </Tooltip>
                              ),
                            },
                          ],
                          selectedKeys: mockMatcher ? [mockMatcher] : [],
                          selectable: true,
                          onSelect: (item) => {
                            setMockMatcher(item.key);
                            trackMockResponsesTargetingSelecting(item.key);
                          },
                        }}
                        trigger={["click"]}
                        className="display-inline-block mock-responses-popover"
                        placement="bottomRight"
                        overlayClassName="mock-responses-popover-overlay"
                      >
                        <div>
                          <Typography.Text
                            className="cursor-pointer mock-responses-popover-dropdown-text"
                            onClick={(e) => e.preventDefault()}
                          >
                            {mockMatcher
                              ? mockMatcher === GLOBAL_CONSTANTS.RULE_KEYS.URL
                                ? "Match entire URL"
                                : mockMatcher === GLOBAL_CONSTANTS.RULE_KEYS.PATH
                                ? "Match only path"
                                : "Match path & query params"
                              : "Select Matching Condition"}{" "}
                          </Typography.Text>
                          <DownOutlined className="mock-responses-popover-dropdown-icon" />
                        </div>
                      </RQDropdown>
                    </Space>
                  }
                  okButtonProps={{
                    disabled: !mockMatcher,
                  }}
                  onConfirm={() => {
                    if (!mockMatcher) {
                      toast.error("Please select a matching condition to proceed.");
                      return;
                    }
                    setCreateMockLoader(true);
                    createMockResponses();
                  }}
                  okText="Create rules"
                  cancelText="Discard"
                  placement="bottom"
                  disabled={
                    !mockResourceType ||
                    selectedRequestsLength === 0 ||
                    (mockResourceType === "graphqlApi" && mockGraphQLKeys.length === 0)
                  }
                  destroyTooltipOnHide
                  trigger={["click"]}
                >
                  <Tooltip
                    title={selectedRequestsLength === 0 ? "Select requests to be mocked" : ""}
                    destroyTooltipOnHide
                    trigger={["hover"]}
                  >
                    <RQButton
                      loading={createMockLoader}
                      type="primary"
                      onClick={() => {
                        trackMockResponsesCreateRulesClicked(selectedRequestsLength);
                      }}
                      disabled={selectedRequestsLength === 0}
                    >
                      <Space>
                        Create mocks
                        <div className="mock-rules-count-badge">{selectedRequestsLength}</div>
                      </Space>
                    </RQButton>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
            <div>
              <RQButton
                size="small"
                icon={<CloseOutlined />}
                onClick={() => {
                  setCreateMocksMode(false);
                  resetMockResponseState();
                  setIsRulesCreated(false);
                }}
              />
            </div>
          </Space>
        </div>
      }
    />
  );
};

export default CreateMocksModeBanner;
