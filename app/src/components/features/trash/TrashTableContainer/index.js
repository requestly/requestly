import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Typography, Tooltip, Space, Button } from "antd";
//UTILS
import { getUserAuthDetails, getAppMode, getRulesSelection } from "../../../../store/selectors";
import { toast } from "utils/Toast";
import { trackRQLastActivity } from "utils/AnalyticsUtils";
//CONSTANTS
import APP_CONSTANTS from "../../../../config/constants";
import { actions } from "store";
import ProCard from "@ant-design/pro-card";
import ProTable from "@ant-design/pro-table";
import { DeleteOutlined, ImportOutlined } from "@ant-design/icons";
import moment from "moment";
import ReactHoverObserver from "react-hover-observer";
import Text from "antd/lib/typography/Text";
import SharedListViewerModal from "components/features/rules/SharedListRuleViewerModal";
import { deleteRecordsFromTrash, importRecordsToLocalStorage } from "utils/trash/TrashUtils";
import { trackTrashRulesRecovered } from "modules/analytics/events/features/trash";
import RuleTypeTag from "../../../common/RuleTypeTag";

const { Link } = Typography;

const TrashTableContainer = ({ records, updateTrash }) => {
  //Global State
  const dispatch = useDispatch();
  const user = useSelector(getUserAuthDetails);
  const appMode = useSelector(getAppMode);
  const rulesSelection = useSelector(getRulesSelection);

  const getSelectedRules = (rulesSelection) => {
    return Object.keys(rulesSelection).filter((ruleId) => rulesSelection[ruleId]);
  };

  const selectedRules = getSelectedRules(rulesSelection);

  const unselectAllRules = (dispatch) => {
    //Unselect All Rules
    dispatch(actions.clearSelectedRules());
  };

  const cleanup = () => {
    //Unselect all rules
    unselectAllRules(dispatch);
  };

  const stableCleanup = useCallback(cleanup, [dispatch]);

  // Component State
  const selectedRowKeys = selectedRules;

  const UNGROUPED_GROUP_ID = APP_CONSTANTS.RULES_LIST_TABLE_CONSTANTS.UNGROUPED_GROUP_ID;

  const onSelectChange = (selectedRowKeys) => {
    // Update the global state so that it could be consumed by other components as well

    // selectedRowKeys also contains the group ids, which we don't need, ProTable will handle it internally!
    const selectedRuleIds = selectedRowKeys.filter((objectId) => {
      return !objectId.startsWith("Group_") && objectId !== UNGROUPED_GROUP_ID;
    });

    const newSelectedRulesObject = {};

    selectedRuleIds.forEach((ruleId) => {
      newSelectedRulesObject[ruleId] = true;
    });

    dispatch(actions.updateSelectedRules(newSelectedRulesObject));
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    checkStrictly: false,
  };

  //Component State
  const [ruleToViewInModal, setRuleToViewInModal] = useState(false);
  const [isSharedListRuleViewerModalActive, setIsSharedListRuleViewModalActive] = useState(false);
  const [areRulesImporting, setAreRulesImporting] = useState(false);

  const toggleSharedListRuleViewerModal = () => {
    setIsSharedListRuleViewModalActive(!isSharedListRuleViewerModalActive);
  };

  const returnSelectedRules = (rules) => {
    let selectedRules;

    if (rules.length) {
      selectedRules = rules;
    } else {
      selectedRules = records.filter((record) => selectedRowKeys.some((key) => key === record.id));
    }

    return selectedRules;
  };

  const handleImportRecords = (rules) => {
    setAreRulesImporting(true);
    let selectedRules = returnSelectedRules(rules);

    importRecordsToLocalStorage(appMode, selectedRules, user.details.profile.uid)
      .then((result) => {
        if (result.success) {
          unselectAllRules(dispatch);
          updateTrash(selectedRules);
          toast.info(`Restored the ${selectedRules.length > 1 ? "rules" : "rule"}`);
          trackTrashRulesRecovered(selectedRules.length);
          dispatch(actions.addRulesAndGroups({ rules: selectedRules, groups: [] }));
        }
        trackRQLastActivity("rules_recovered_from_trash");

        setAreRulesImporting(false);
      })
      .catch((err) => {
        setAreRulesImporting(false);
      });
  };

  const handleDeleteRecords = (rules) => {
    let selectedRules = returnSelectedRules(rules);

    deleteRecordsFromTrash(user.details.profile.uid, selectedRules).then((result) => {
      if (result.success) {
        unselectAllRules(dispatch);
        updateTrash(selectedRules);
        toast.info(`Deleted the ${selectedRules.length > 1 ? "rules" : "rule"}`);
      }
    });
  };

  const openRuleViewerInModal = (rule) => {
    setRuleToViewInModal(rule);
    setIsSharedListRuleViewModalActive(true);
  };

  const handleRuleNameOnClick = (e, rule) => {
    e.stopPropagation();
    openRuleViewerInModal(rule);
  };

  useEffect(() => {
    return stableCleanup;
  }, [stableCleanup]);

  const columns = [
    {
      title: "Name",
      dataIndex: "ruleName",
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => <Link onClick={(ev) => handleRuleNameOnClick(ev, record)}>{record.name}</Link>,
    },
    {
      title: "Rule Type",
      dataIndex: "ruleType",
      width: "auto",
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => <RuleTypeTag ruleType={record.ruleType} />,
    },
    {
      title: "Creation Date",
      dataIndex: "ruleCreationDate",
      width: "auto",
      responsive: ["lg"],
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => {
        return <span>{moment(record.creationDate).format("MMM DD, YYYY")}</span>;
      },
    },
    {
      title: "Deletion Date",
      dataIndex: "ruledeletedDate",
      width: "auto",
      responsive: ["md"],
      textWrap: "word-break",
      ellipsis: true,
      render: (_, record) => {
        return <span>{moment(record.deletedDate).format("MMM DD, YYYY")}</span>;
      },
    },
    {
      title: "Actions",
      align: "center",
      render: (_, record) => {
        return (
          <ReactHoverObserver>
            {({ isHovering }) => (
              <Space>
                <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                  <Tooltip title="Restore Rule">
                    <ImportOutlined onClick={() => handleImportRecords([record])} />
                  </Tooltip>
                </Text>
                <Text type={isHovering ? "primary" : "secondary"} style={{ cursor: "pointer" }}>
                  <Tooltip title="Delete Rule">
                    <DeleteOutlined onClick={() => handleDeleteRecords([record])} />
                  </Tooltip>
                </Text>
              </Space>
            )}
          </ReactHoverObserver>
        );
      },
    },
  ];

  const getSortedRecordsAccordingToDeletionDate = (records) => {
    return [...records].sort((a, b) => b.deletedDate - a.deletedDate);
  };

  const sortedRecords = useMemo(() => getSortedRecordsAccordingToDeletionDate(records), [records]);

  return (
    <>
      {isSharedListRuleViewerModalActive ? (
        <SharedListViewerModal
          isOpen={isSharedListRuleViewerModalActive}
          toggle={toggleSharedListRuleViewerModal}
          rule={ruleToViewInModal}
        />
      ) : null}
      <ProCard className="primary-card github-like-border" title={null}>
        <h2>Deleted Rules</h2>
        <h4>Rules that you have deleted over the past 30 days are available here.</h4>
        <ProTable
          rowKey="id"
          dataSource={sortedRecords}
          options={false}
          pagination={false}
          search={false}
          dateFormatter={false}
          columns={columns}
          rowSelection={rowSelection}
          className="records-table"
          tableAlertRender={(_) => {
            return (
              <span>{`${_.selectedRowKeys.length} ${_.selectedRowKeys.length > 1 ? "Rules" : "Rule"} selected`}</span>
            );
          }}
          tableAlertOptionRender={() => (
            <Space>
              <Button
                type="primary"
                onClick={handleImportRecords}
                icon={<ImportOutlined />}
                loading={areRulesImporting}
              >
                Restore
              </Button>
              <Button onClick={handleDeleteRecords} icon={<DeleteOutlined />}>
                Delete
              </Button>
            </Space>
          )}
        />
      </ProCard>
    </>
  );
};

export default TrashTableContainer;
