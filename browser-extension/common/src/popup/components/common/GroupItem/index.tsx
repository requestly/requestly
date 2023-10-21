import React, { useCallback, useState } from "react";
import { Col, Row, Switch, Tooltip } from "antd";
import { CaretRightOutlined } from "@ant-design/icons";
import RuleItem from "../RuleItem";
import PinAction from "../PinAction";
import { Group, Rule, Status } from "../../../../types";
import { useRecords } from "../../../contexts/RecordsContext";
import GroupIcon from "../../../../../resources/icons/groupIcon.svg";
import RecordName from "../RecordName";
import "./groupItem.css";
import { EVENT, sendEvent } from "../../../events";

interface GroupItemProps {
  group: Group;
}

const GroupItem: React.FC<GroupItemProps> = ({ group }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const { updateGroup } = useRecords();
  const isGroupActive = group.status === Status.ACTIVE;

  const handleToggleStatus = useCallback(() => {
    updateGroup({
      ...group,
      status: isGroupActive ? Status.INACTIVE : Status.ACTIVE,
    });
    sendEvent(EVENT.GROUP_TOGGLED, {
      status: isGroupActive ? Status.INACTIVE : Status.ACTIVE,
    });
  }, [group, isGroupActive, updateGroup]);

  return (
    <li>
      <Row align="middle" className="record-item" wrap={false}>
        <Col span={19} className="record-name-container" onClick={() => setIsExpanded((prev) => !prev)}>
          <Row wrap={false} align="middle">
            <Col>
              <CaretRightOutlined
                rotate={isExpanded ? 90 : 0}
                className={`group-expand-icon ${isExpanded ? "group-expanded" : ""}`}
              />
            </Col>
            <Col>
              <Row wrap={false} align="middle">
                <Tooltip title="Group" color="var(--neutrals-black)">
                  <span className={`group-icon-wrapper ${isExpanded ? "group-expanded" : ""}`}>
                    <GroupIcon />
                  </span>
                </Tooltip>

                <RecordName name={group.name as string}>
                  <span className="record-name">{group.name as string}</span>
                </RecordName>
              </Row>
            </Col>
          </Row>
        </Col>

        <Col span={2} className="icon-container">
          <Row align="middle">
            <PinAction record={group} updateRecord={updateGroup} />
          </Row>
        </Col>

        <Col span={3}>
          <Switch checkedChildren="ON" unCheckedChildren="OFF" onChange={handleToggleStatus} checked={isGroupActive} />
        </Col>
      </Row>

      {isExpanded && (
        <Row className="group-rules">
          <Col span={24}>
            {group.children.length > 0 ? (
              group.children.map((rule: Rule) => <RuleItem key={rule.id} rule={rule} isChildren={true} />)
            ) : (
              <div className="text-gray empty-group-message">No rules present in this group!</div>
            )}
          </Col>
        </Row>
      )}
    </li>
  );
};

export default React.memo(GroupItem);
