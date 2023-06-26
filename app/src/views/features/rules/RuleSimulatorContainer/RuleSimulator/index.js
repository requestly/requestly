import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Input, Button, Form, Row, Col, Timeline, Typography, Tooltip } from "antd";
//Emulating the rule
import { RULE_PROCESSOR } from "@requestly/requestly-core";

import { CONSTANTS as GLOBAL_CONSTANTS } from "@requestly/requestly-core";
//Utils
import { toast } from "utils/Toast";
import { getCurrentlySelectedRuleData } from "store/selectors";
import { isValidUrl } from "utils/FormattingHelper";
import { cloneDeep, isEmpty } from "lodash";
import {
  FaBan,
  FaClock,
  FaMinusCircle,
  FaPlusCircle,
  FaRandom,
  FaTools,
  FaMobileAlt,
  FaCodeBranch,
  FaCode,
} from "react-icons/fa";
import { v4 as uuidv4 } from "uuid";
import RuleSimulatorModal from "components/features/rules/RuleSimulatorModal";
import { trackSimulateRulesEvent } from "modules/analytics/events/features/ruleSimulator";
import { fixRuleRegexSourceFormat } from "utils/rules/misc";

const STEP_TYPES = {
  REDIRECT: "redirect",
  CANCEL: "cancel",
  MODIFY: "modify",
  HEADER: "header",
  REQUEST: "request",
  RESPONSE: "response",
  DELAY: "delay",
  USERAGENT: "user-agent",
  INSERT: "insert",
};

const { Paragraph } = Typography;

const RuleSimulator = () => {
  const dispatch = useDispatch();

  const [showOutput, setShowOutput] = useState(false);
  const [outputSteps, setOutputSteps] = useState([]);
  //url entered by user to test
  const [testUrl, setTestUrl] = useState("");
  // modal to show modified response / injected script
  const [isOpen, setIsOpen] = useState(false);
  const [editorFields, setEditorFields] = useState({
    body: "",
    mode: "javascript",
  });
  const ruleData = useSelector(getCurrentlySelectedRuleData);
  // Modal toggle
  const toggle = () => {
    setIsOpen((state) => !state);
  };

  // Modal toggle for inject scripts
  const showScript = (mode, body) => {
    setEditorFields({ body, mode });
    toggle();
  };

  //generates the simulated url
  const processURLModificationRules = (rule, requestURL) => {
    // Reset existing
    setShowOutput(false);
    setOutputSteps([]);
    const newOutputSteps = [];

    const ruleProcessor = RULE_PROCESSOR.getInstance(rule.ruleType);
    let simulatedUrl;

    const regexValidatedRule = fixRuleRegexSourceFormat(dispatch, rule);

    simulatedUrl = ruleProcessor.process({
      rule: cloneDeep(regexValidatedRule),
      requestURL,
      originalHeaders: [],
      typeOfHeaders: "Request",
    });

    const actions =
      rule.ruleType !== GLOBAL_CONSTANTS.RULE_TYPES.HEADERS
        ? []
        : rule.pairs.flatMap((pair) => {
            const requestHeaders =
              pair.modifications["Request"]?.map((modification) => {
                return {
                  operation:
                    modification.type === "Add" ? "Added" : modification.type === "Modify" ? "Modified" : "Removed",
                  header: modification.header,
                  newVal: modification.value,
                  target: "Request",
                };
              }) || [];

            const responseHeaders =
              pair.modifications["Response"]?.map((modification) => {
                return {
                  operation:
                    modification.type === "Add" ? "Added" : modification.type === "Modify" ? "Modified" : "Removed",
                  header: modification.header,
                  newVal: modification.value,
                  target: "Response",
                };
              }) || [];

            return [...requestHeaders, ...responseHeaders];
          });

    const lastIdxRequest = actions.lastIndexOf((rule) => rule.target === "Request");

    actions.splice(lastIdxRequest, 0, {});

    if (simulatedUrl) {
      switch (rule.ruleType) {
        case "Redirect":
        case "Replace":
        case "QueryParam":
          newOutputSteps.push({
            id: uuidv4(),
            type: STEP_TYPES.REDIRECT,
            newURL: simulatedUrl.url,
          });
          break;
        case "Cancel":
          newOutputSteps.push({
            id: uuidv4(),
            type: STEP_TYPES.CANCEL,
            newURL: simulatedUrl.url,
          });
          break;
        case "Request":
          newOutputSteps.push({
            id: uuidv4(),
            type: STEP_TYPES.REQUEST,
            request: simulatedUrl.request,
          });
          setEditorFields({
            body: simulatedUrl.request,
            mode: simulatedUrl.requestType === GLOBAL_CONSTANTS.REQUEST_BODY_TYPES.CODE ? "javascript" : "json",
          });
          break;
        case "Response":
          newOutputSteps.push({
            id: uuidv4(),
            type: STEP_TYPES.RESPONSE,
            response: simulatedUrl.response,
          });
          setEditorFields({
            body: simulatedUrl.response,
            mode: simulatedUrl.responseType === GLOBAL_CONSTANTS.RESPONSE_BODY_TYPES.CODE ? "javascript" : "json",
          });
          break;
        case "Delay":
          newOutputSteps.push({
            id: uuidv4(),
            type: STEP_TYPES.DELAY,
            delayType: simulatedUrl.delayType,
            delay: simulatedUrl.delay,
          });
          break;
        case "Headers":
          actions.forEach(({ operation, newVal, header, target }) =>
            newOutputSteps.push({
              id: uuidv4(),
              type: STEP_TYPES.HEADER,
              operation,
              newVal,
              header,
              target,
            })
          );
          break;
        case "UserAgent":
          newOutputSteps.push({
            id: uuidv4(),
            type: STEP_TYPES.USERAGENT,
            headerType: simulatedUrl.newRequestHeaders[0].name,
            headerValue: simulatedUrl.newRequestHeaders[0].value,
          });
          break;

        case "Script":
          newOutputSteps.push({
            id: uuidv4(),
            type: STEP_TYPES.INSERT,
            data: simulatedUrl.data,
          });
          break;

        default:
          break;
      }
    }

    // End of simulation
    // Show output to user
    setOutputSteps(newOutputSteps);
    setShowOutput(true);
  };

  //calling the rule processor function
  const doSimulate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    trackSimulateRulesEvent(ruleData.ruleType);

    let url = testUrl;

    if (
      !isValidUrl(url) &&
      !url.startsWith("$") &&
      !url.startsWith("http://") &&
      !url.startsWith("https://") &&
      !url.startsWith("file://")
    ) {
      url = "http://" + testUrl;
      setTestUrl(url);
    }

    if (isValidUrl(url)) {
      processURLModificationRules(ruleData, url);
    } else {
      toast.warn("Please provide a valid URL to simulate.");
    }
  };

  const renderRuleSimulator = () => {
    return (
      <>
        <Form>
          <Row>
            <Col span={22}>
              <Form.Item label="Request URL">
                <Input
                  type="text"
                  value={testUrl}
                  onChange={(event) => setTestUrl(event.target.value)}
                  placeholder="Enter URL to test"
                />
              </Form.Item>
            </Col>
            <Col span={2}>
              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Tooltip placement="bottomLeft" title={"Test this rule"}>
                  <Button type="default" onClick={doSimulate}>
                    Test rule
                  </Button>
                </Tooltip>
              </Form.Item>
            </Col>
          </Row>
          {renderOutput()}
        </Form>
      </>
    );
  };

  const renderOutput = () => {
    if (showOutput) {
      return (
        <Form.Item>
          <Row style={{ marginBottom: "5%" }}>Result:</Row>
          <Row>
            <Col span={24} align="center">
              <Timeline>
                <Timeline.Item color="grey">Request Start</Timeline.Item>
                {outputSteps.map((step) => getTimelineFromStep(step))}
                <Timeline.Item color="grey">Request End</Timeline.Item>
              </Timeline>
            </Col>
          </Row>
          {isEmpty(outputSteps) ? (
            <Row>
              <i>This Rule makes no change to the given request.</i>
            </Row>
          ) : null}
        </Form.Item>
      );
    } else return null;
  };

  const getTimelineFromStep = (step) => {
    switch (step.type) {
      case STEP_TYPES.REDIRECT:
        return (
          <Timeline.Item dot={<FaRandom className="fix-icon-is-up timeline-clock-icon" />} color="green" key={step.id}>
            <span style={{ color: "green" }}>Redirected to</span>{" "}
            {
              <Paragraph
                ellipsis={{
                  rows: 2,
                  expandable: true,
                  symbol: "more",
                }}
                style={{ color: "rgba(255, 255, 255, 0.87)" }}
              >
                {step.newURL}
              </Paragraph>
            }
          </Timeline.Item>
        );

      case STEP_TYPES.USERAGENT:
        return (
          <Timeline.Item
            dot={<FaMobileAlt className="fix-icon-is-up timeline-clock-icon" />}
            color="green"
            key={step.id}
          >
            <span style={{ color: "green" }}>Replaced</span>{" "}
            {
              <Paragraph
                ellipsis={{
                  rows: 2,
                  expandable: true,
                  symbol: "more",
                }}
                style={{ color: "rgba(0, 0, 0, 0.45)" }}
              >
                <span style={{ fontWeight: "bold", color: "rgba(0, 0, 0, .8)" }}>{step.headerType}</span>:
                {step.headerValue}
              </Paragraph>
            }
          </Timeline.Item>
        );

      case STEP_TYPES.INSERT:
        return (
          <Timeline.Item dot={<FaCode className="fix-icon-is-up timeline-clock-icon" />} color="green" key={step.id}>
            <span style={{ color: "green" }}>Added</span>{" "}
            {step.data.jsScripts.map((js) => (
              <span
                onClick={() => showScript("javascript", js.value)}
                key={js.id}
                style={{
                  color: "rgba(0, 0, 0, 0.45)",
                  display: "block",
                  marginTop: ".4rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                js code
              </span>
            ))}
            {step.data.cssScripts.map((css) => (
              <span
                onClick={() => showScript("css", css.value)}
                key={css.id}
                style={{
                  color: "rgba(0, 0, 0, 0.45)",
                  display: "block",
                  marginTop: ".4rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                css code
              </span>
            ))}
            {step.data.libraries.map((lib) => (
              <span
                key={lib}
                style={{
                  color: "rgba(0, 0, 0, 0.45)",
                  display: "block",
                  marginTop: ".4rem",
                }}
              >
                {lib}
              </span>
            ))}
          </Timeline.Item>
        );

      case STEP_TYPES.CANCEL:
        return (
          <Timeline.Item dot={<FaBan className="fix-icon-is-up timeline-clock-icon" />} color="red" key={step.id}>
            <span style={{ color: "red" }}>Request Blocked</span>{" "}
            {
              <Paragraph
                ellipsis={{
                  rows: 2,
                  expandable: true,
                  symbol: "more",
                }}
                style={{ color: "rgba(0, 0, 0, 0.45)" }}
              >
                {step.newURL}
              </Paragraph>
            }
          </Timeline.Item>
        );

      case STEP_TYPES.DELAY:
        return (
          <Timeline.Item dot={<FaClock className="fix-icon-is-up timeline-clock-icon" />} color="blue" key={step.id}>
            <span style={{ color: "blue" }}>Added </span>{" "}
            {
              <Paragraph
                ellipsis={{
                  rows: 2,
                  expandable: true,
                  symbol: "more",
                }}
                style={{ color: "rgba(0, 0, 0, 0.45)" }}
              >
                delay of {step.delay} ms
              </Paragraph>
            }
          </Timeline.Item>
        );

      case STEP_TYPES.REQUEST:
        return (
          <Timeline.Item
            dot={<FaCodeBranch className="fix-icon-is-up timeline-clock-icon" />}
            color="green"
            key={step.id}
          >
            <span style={{ color: "green" }}>Modified Request body</span>
            <p
              className="show-request-body"
              onClick={toggle}
              style={{
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Show Request body
            </p>
          </Timeline.Item>
        );

      case STEP_TYPES.RESPONSE:
        return (
          <Timeline.Item
            dot={<FaCodeBranch className="fix-icon-is-up timeline-clock-icon" />}
            color="green"
            key={step.id}
          >
            <span style={{ color: "green" }}>Modified Response</span>
            <p
              className="show-response"
              onClick={toggle}
              style={{
                textDecoration: "underline",
                cursor: "pointer",
              }}
            >
              Show Response
            </p>
          </Timeline.Item>
        );

      case STEP_TYPES.HEADER:
        return (
          <Timeline.Item
            dot={
              step.operation === "Added" ? (
                <FaPlusCircle className="fix-icon-is-up timeline-clock-icon" />
              ) : step.operation === "Removed" ? (
                <FaMinusCircle className="fix-icon-is-up timeline-clock-icon" />
              ) : step.operation === "Modified" ? (
                <FaTools className="fix-icon-is-up timeline-clock-icon" />
              ) : null
            }
            color={step.target === "Request" ? "blue" : step.target === "Response" ? "green" : "grey"}
            key={step.id}
          >
            {step.target === "Request" ? (
              <span style={{ color: "blue" }}>
                {String(step.operation).toUpperCase()} Request Header-
                {step.header}
                {step.operation === "Added"
                  ? `:${step.newVal}`
                  : step.operation === "Modified"
                  ? `to ${step.newVal}`
                  : ``}
              </span>
            ) : step.target === "Response" ? (
              <span style={{ color: "green" }}>
                {String(step.operation).toUpperCase()} Response Header-
                {step.header}
                {step.operation === "Added"
                  ? `:${step.newVal}`
                  : step.operation === "Modified"
                  ? ` to ${step.newVal}`
                  : ``}
              </span>
            ) : (
              <span style={{ color: "black" }}>Sent request with modified headers</span>
            )}{" "}
            {
              <Paragraph
                ellipsis={{
                  rows: 2,
                  expandable: true,
                  symbol: "more",
                }}
                style={{ color: "rgba(0, 0, 0, 0.45)" }}
              >
                {step.newURL}
              </Paragraph>
            }
          </Timeline.Item>
        );

      default:
        return null;
    }
  };

  const renderModalTitle = () => {
    if (outputSteps[0]?.type && isOpen) {
      switch (outputSteps[0].type) {
        case STEP_TYPES.RESPONSE:
          return "Custom response";
        case STEP_TYPES.REQUEST:
          return "Custom request body";
        case STEP_TYPES.INSERT:
          return "Custom script";
        default:
          return "Rule simulator";
      }
    }
  };

  return (
    // <Panel header="Simulate this Rule" key="1">
    <>
      {renderRuleSimulator()}
      <RuleSimulatorModal
        mode={editorFields.mode}
        body={editorFields.body}
        title={renderModalTitle()}
        isOpen={isOpen}
        toggle={toggle}
      />
    </>
  );
};

export default RuleSimulator;
