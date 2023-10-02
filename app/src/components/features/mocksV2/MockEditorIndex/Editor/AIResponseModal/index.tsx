import { Button, Col, Input, Row } from "antd";
import CodeEditor from "components/misc/CodeEditor";
import { getFunctions, httpsCallable } from "firebase/functions";
import { RQModal } from "lib/design-system/components";
import { ImMagicWand } from "@react-icons/all-files/im/ImMagicWand";
import { useState } from "react";
import { toast } from "utils/Toast";
import "./index.css";
// @ts-ignore
import Typewriter from "typewriter-effect/dist/core";
import Logger from "lib/logger";
import {
  trackAiResponseGenerateFailed,
  trackAiResponseGenerateClicked,
  trackAiResponseGenerated,
  trackAiResponseUseClicked,
} from "modules/analytics/events/features/mocksV2";

interface Props {
  toggleOpen: (open: boolean) => void;
  isOpen: boolean;
  handleAiResponseUsed: (responseText: string) => void;
}

const AIResponseModal = ({ isOpen = false, toggleOpen, handleAiResponseUsed }: Props) => {
  const [prompt, setPrompt] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [responseJson, setResponseJson] = useState(null);
  const [response, setResponse] = useState("");

  let typewriter = new Typewriter(null, {
    onCreateTextNode: (character: any, node: any): any => {
      setResponse((prev) => prev.concat(character));
      return null;
    },
    delay: 2,
  });

  const handleResponseFetched = (responseJSON: any) => {
    const tempResponse = JSON.stringify(responseJSON, null, 2);
    setResponseJson(responseJSON);
    setResponse("");
    setIsTyping(true);

    typewriter = typewriter
      .typeString(tempResponse)
      .start()
      .callFunction((state: any) => {
        setIsTyping(false);
      });
  };

  const handleUseResponseClicked = () => {
    trackAiResponseUseClicked(prompt);
    const responseText = JSON.stringify(responseJson, null, 2);
    typewriter.stop();
    setIsTyping(false);
    setResponse(responseText);
    handleAiResponseUsed(responseText);
    toggleOpen(false);
  };

  const fetchResponse = () => {
    if (!prompt) {
      toast.error("Please enter a prompt");
    }

    trackAiResponseGenerateClicked(prompt);

    const functions = getFunctions();
    const fetchAiMockResponse = httpsCallable(functions, "generateAIMockResponse");

    setIsLoading(true);
    fetchAiMockResponse({ input: prompt })
      .then((res: any) => {
        if (res?.data?.success) {
          trackAiResponseGenerated(prompt);
          Logger.log(res?.data?.responseJSON);
          Logger.log(res?.data?.response);
          handleResponseFetched(res?.data?.responseJSON);
        } else {
          trackAiResponseGenerateFailed(prompt);
          toast.error("Response can't be generated");
        }
        setIsLoading(false);
      })
      .catch((err) => {
        trackAiResponseGenerateFailed(prompt);
        Logger.log(err);
        toast.error("Response can't be generated");
        setIsLoading(false);
      });
  };

  return (
    <RQModal centered open={isOpen} onCancel={() => toggleOpen(false)} width="50%">
      <Col className="rq-modal-content ai-response-modal-content">
        <Row justify="space-between">
          <Col flex="1 0 auto" className="ai-prompt-input-container">
            <Input
              disabled={isLoading}
              className="ai-prompt-input"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter Prompt. Eg: List of users with name, address, avatar, age, job, email"
            />
          </Col>
          <Col flex="0 0 auto">
            <Button size="large" disabled={!prompt} loading={isLoading} type="primary" onClick={fetchResponse}>
              <ImMagicWand /> &nbsp; {isLoading ? "Generating" : "Generate"}
            </Button>
          </Col>
        </Row>
        <Row className="ai-response-container">
          <Col span={24}>
            {response ? (
              // @ts-ignore
              <CodeEditor
                language={"json"}
                value={response}
                height={400}
                readOnly={true}
                isCodeMinified={true}
                handleChange={() => {}}
              />
            ) : null}
          </Col>
        </Row>
      </Col>
      {/* footer */}
      <Row align="middle" justify="end" className="rq-modal-footer">
        <Col>
          <Button type="primary" disabled={!responseJson || isTyping} onClick={handleUseResponseClicked}>
            Use Response
          </Button>
        </Col>
      </Row>
    </RQModal>
  );
};

export default AIResponseModal;
