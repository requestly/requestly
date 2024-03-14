import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
//@ts-ignore
import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
import { CheckCircleOutlined, CloseOutlined, DownOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Popconfirm, Space, Tooltip, Typography } from "antd";
import { RQButton, RQDropdown } from "lib/design-system/components";
import CreatableSelect from "react-select/creatable";
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
} from "components/mode-specific/desktop/InterceptTraffic/WebTraffic/TrafficTableV2/utils";
import { useSelector } from "react-redux";
import { getSessionId, getSessionName } from "store/features/network-sessions/selectors";
import { getAppMode } from "store/selectors";
import { StorageService } from "init";
import Logger from "lib/logger";

interface Props {
  setMockGraphQLKeys: (key: string[]) => void;
  mockGraphQLKeys: string[];
  mockResourceType: string;
  selectedMockRequests: Record<string, any>;
  resetMockResponseState: () => void;
  setCreateMocksMode: (value: boolean) => void;
}

const CreateMocksModeBanner: React.FC<Props> = ({
  setMockGraphQLKeys,
  mockGraphQLKeys,
  mockResourceType,
  selectedMockRequests,
  resetMockResponseState,
  setCreateMocksMode,
}) => {
  const navigate = useNavigate();

  const networkSessionId = useSelector(getSessionId);
  const sessionName = useSelector(getSessionName);
  const appMode = useSelector(getAppMode);

  const [isRulesCreated, setIsRulesCreated] = useState(false);
  const [createdGroupName, setCreatedGroupName] = useState("");
  const [createMockLoader, setCreateMockLoader] = useState(false);
  const [mockMatcher, setMockMatcher] = useState<string | null>(null);

  const selectedRequestsLength = useMemo(() => {
    return Object.keys(selectedMockRequests).length;
  }, [selectedMockRequests]);

  const createMockResponses = useCallback(async () => {
    trackMockResponsesRuleCreationStarted(selectedRequestsLength);

    const { groupId: newSessionGroupId, groupName: newSessionGroupName } = await getOrCreateSessionGroup(
      {
        networkSessionId,
        networkSessionName: sessionName,
      },
      appMode
    );

    const newRules = Object.values(selectedMockRequests).map((log: any) => {
      return createResponseMock({
        response: log.response.body,
        urlMatcher: mockMatcher,
        requestUrl: log.url,
        operationKeys: mockGraphQLKeys,
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
      banner={true}
      showIcon={false}
      message={
        <div className="display-flex w-100" style={{ justifyContent: "space-between", alignItems: "center" }}>
          <div className="w-100">
            {isRulesCreated ? (
              <>
                <CheckCircleOutlined style={{ color: "var(--success)" }} className="mr-4" />
                <span>{`Mock rules have been created successfully in the group: ${createdGroupName}`}</span>
              </>
            ) : selectedRequestsLength === 0 ? (
              <span>
                {mockResourceType === "graphqlApi"
                  ? `Enter the request payload key to filter specific graphQL requests in the traffic table.`
                  : `Select the REST/Static requests that you want to mock from the traffic table below.`}
              </span>
            ) : (
              <span>{`${selectedRequestsLength} requests selected`}</span>
            )}
          </div>
          <Space direction="horizontal">
            {mockResourceType === "graphqlApi" && !isRulesCreated && (
              <div className="mr-16">
                <CreatableSelect
                  isMulti={true}
                  isClearable={true}
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 4,
                    border: "none",
                    colors: {
                      ...theme.colors,
                      primary: "var(--surface-1)",
                      primary25: "var(--surface-2)",
                      neutral0: "var(--surface-1)",
                      neutral10: "var(--surface-3)", // tag background color
                      neutral80: "var(--text-default)", // tag text color
                      danger: "var(--text-default)", // tag cancel icon color
                      dangerLight: "var(--surface-3)", // tag cancel background color
                    },
                  })}
                  isValidNewOption={(string) => !!string}
                  noOptionsMessage={() => null}
                  formatCreateLabel={() => "Hit Enter to add"}
                  placeholder={"Enter graphQL keys"}
                  onChange={(selectors) => {
                    trackMockResponsesGraphQLKeyEntered(selectors.map((selector: any) => selector.value));
                    setMockGraphQLKeys(selectors.map((selector: any) => selector.value));
                  }}
                  styles={{
                    indicatorSeparator: (provided) => ({
                      ...provided,
                      display: "none",
                    }),
                    dropdownIndicator: (provided) => ({ ...provided, display: "none" }),
                    control: (provided) => ({
                      ...provided,
                      boxShadow: "none",
                      border: "1px solid var(--border)",
                      backgroundColor: "var(--background)",
                    }),
                    container: (provided) => ({
                      ...provided,
                      flexGrow: 1,
                      width: "50ch",
                    }),
                  }}
                />
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
                    title={selectedRequestsLength === 0 ? "Please select requests to proceed" : ""}
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
                        Create Mock Rules
                        <div className="mock-rules-count-badge">{selectedRequestsLength}</div>
                      </Space>
                    </RQButton>
                  </Tooltip>
                </Popconfirm>
              )}
            </div>
            <div>
              <Tooltip placement="left" title="Clear selected mode">
                <RQButton
                  size="small"
                  icon={<CloseOutlined />}
                  onClick={() => {
                    setCreateMocksMode(false);
                    resetMockResponseState();
                    setIsRulesCreated(false);
                  }}
                />
              </Tooltip>
            </div>
          </Space>
        </div>
      }
    />
  );
};

export default CreateMocksModeBanner;
