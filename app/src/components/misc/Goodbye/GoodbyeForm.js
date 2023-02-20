import { SendOutlined } from "@ant-design/icons";
import { Button, Checkbox } from "antd";
import { Input } from "antd";
import { Modal } from "antd";
import { useState } from "react";
import { isEmpty } from "lodash";
import { toast } from "utils/Toast.js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { redirectToLandingHomePage } from "utils/RedirectionUtils";
import { useNavigate } from "react-router-dom";
const { TextArea } = Input;

const REASONS = [
  "I don't need it anymore",
  "It didn't work for me",
  "I found a better alternative",
  "I don't like the look and feel",
];
const initResponse = {
  reasonsArray: [],
  feedbackText: "",
};

const GoodbyeForm = () => {
  const [modal, contextHolder] = Modal.useModal();
  const navigate = useNavigate();
  // Component State
  const [response, setResponse] = useState(initResponse);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const onCheckBoxChange = (e) => {
    if (e.target.checked) {
      setResponse({
        ...response,
        reasonsArray: [...response.reasonsArray, e.target.data],
      });
    } else {
      setResponse({
        ...response,
        reasonsArray: response.reasonsArray.filter(
          (check) => check !== e.target.data
        ),
      });
    }
  };

  const handleResponseSubmit = (e) => {
    e.preventDefault();

    if (isEmpty(response.reasonsArray)) {
      if (isEmpty(response.feedbackText)) {
        toast.error("Please fill-in the reason first");
        return;
      }
    }

    const functions = getFunctions();
    const submitUninstallFeedback = httpsCallable(
      functions,
      "submitUninstallFeedback"
    );

    setIsActionLoading(true);

    submitUninstallFeedback(response)
      .then(() => {
        setIsActionLoading(false);
        modal.success({
          title: "Thanks for your feedback and helping us improve Requestly",
        });

        // Now take user to landing pages - we can improve such post action later
        setTimeout(() => {
          redirectToLandingHomePage(navigate);
        }, 3200);
      })
      .catch((err) => toast.error(err.message));
  };

  return (
    <div className="goodbye-form-wrapper">
      <h3>Uninstall reasons:</h3>
      <form>
        <div className="checkbox-wrapper">
          {REASONS.map((reason, i) => (
            <Checkbox
              data={reason}
              className={i === 0 ? "check reason-checkbox" : " reason-checkbox"}
              onChange={onCheckBoxChange}
              key={i}
            >
              {reason}
            </Checkbox>
          ))}
        </div>

        <TextArea
          value={response.feedbackText}
          className="feedback-textarea"
          onChange={(e) =>
            setResponse({ ...response, feedbackText: e.target.value })
          }
          placeholder="Any other feedback? (optional)"
          autoSize={{
            minRows: 3,
            maxRows: 5,
          }}
        />

        <Button
          type="primary"
          icon={<SendOutlined />}
          className="feedback-submit-btn"
          onClick={handleResponseSubmit}
          loading={isActionLoading}
        >
          Send Feedback
        </Button>
      </form>
      <div>{contextHolder}</div>
    </div>
  );
};

export default GoodbyeForm;
